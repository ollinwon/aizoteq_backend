const express = require('express');
const app = express();
const db = require('./dbconnection');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const jwksClient = require('jwks-rsa');
const { promisify } = require('util');
const Joi = require('joi');
const signup=require('./signup')

app.use('/signup',signup);
app.use(express.json());
// app.use(bodyParser.json());
// Cognito settings
const COGNITO_REGION = process.env.COGNITO_REGION;
const COGNITO_USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;  // Updated with your user pool ID
const COGNITO_ISSUER = `https://cognito-idp.${COGNITO_REGION}.amazonaws.com/${COGNITO_USER_POOL_ID}`;
const client = jwksClient({
    jwksUri: `${COGNITO_ISSUER}/.well-known/jwks.json`,  // JWK URI for your pool
});
const getSigningKey = promisify(client.getSigningKey.bind(client));


// Middleware for JWT validation
// Middleware to validate JWT
async function validateJwt(req, res, next) {
    const token = req.headers.authorization;
    if (!token || !token.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Invalid authorization header format' });
    }

    const bearerToken = token.split(' ')[1]; // Remove "Bearer " prefix
    try {
        const decoded = await jwt.verify(
            bearerToken,
            async (header) => {
                const key = await getSigningKey(header.kid);
                return key.getPublicKey();
            },
            { issuer: COGNITO_ISSUER }
        );

        req.user = decoded; // Add decoded token to the request object

        const userSub = decoded.sub; // Assuming `sub` is the identifier
        if (!userSub) {
            return res.status(403).json({ message: 'JWT does not contain a valid sub field' });
        }

        // Check if the user exists in the database and retrieve their role and jwtsub
        const connection = await db.getConnection();
        const [rows] = await connection.query(
            'SELECT userRole, jwtsub FROM Users WHERE jwtsub = ?',
            [userSub]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Attach user data (role and jwtsub) to the request object
        req.user.role = rows[0].userRole;
        req.user.jwtsub = rows[0].jwtsub;

        connection.release();
        next();
    } catch (err) {
        console.error('JWT verification failed:', err);
        return res.status(401).json({ message: 'Invalid or expired token', error: err.message });
    }
}

// Middleware for role-based access control
function authorizeRoles(...allowedRoles) {
    return (req, res, next) => {
        const userRole = req.user.role;
        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({ message: 'Access forbidden: insufficient role' });
        }
        next();
    };
}


// Validation schemas
const thingSchema = Joi.object({
    thingName: Joi.string().required(),
    batchId: Joi.string().required(),
    model: Joi.string().required(),
    serialno: Joi.string().required(),
    type: Joi.string().required(),
});

const attributesSchema = Joi.array().items(
    Joi.object({
        attributeName: Joi.string().required(),
        attributeValue: Joi.string().required(),
    })
);

const bodySchema = Joi.object({
    thing: thingSchema,
    attributes: attributesSchema,
});

// Protect the /app/addThing endpoint for admins and staff
app.post(
    "/app/addThing",
    validateJwt,
    authorizeRoles("admin", "staff"), // Allow only admin and staff
    async (req, res) => {
        const { error } = bodySchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: 'Invalid input data', error: error.details });
        }

        const { thing, attributes } = req.body;
        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            // Insert Thing
            const [thingResult] = await connection.query(
                `INSERT INTO things (id, thingName, createdBy, batchId, model, serialno, type)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    thing.serialno,
                    thing.thingName,
                    req.user.username, // Using the authenticated user's username
                    thing.batchId,
                    thing.model,
                    thing.serialno,
                    thing.type
                ]
            );

            // Insert Attributes and Devices
            let counter = 1;
            for (const attr of attributes) {
                // Insert ThingAttributes
                await connection.query(
                    `INSERT INTO ThingAttributes (thingId, attributeName, attributeValue, securityKey)
                     VALUES (?, ?, ?, ?)`,
                    [thing.serialno, attr.attributeName, attr.attributeValue, null]
                );

                // Validate and Insert Devices
                const totalDevices = parseInt(attr.attributeValue, 10);
                if (totalDevices > 100) { // Limit the number of devices
                    throw new Error(`Too many devices requested for attribute ${attr.attributeName}`);
                }

                for (let i = 1; i <= totalDevices; i++) {
                    const deviceId = `${thing.serialno}_${counter}`;
                    const name = `${attr.attributeName}_${i}`;
                    await connection.query(
                        `INSERT INTO Devices (thingId, deviceId, macAddress, hubIndex, roomId, createdBy, enable, status, icon, name, type)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            thing.serialno,
                            deviceId,
                            thing.serialno,
                            counter,
                            null,
                            req.user.username,
                            true,
                            "new",
                            null,
                            name,
                            attr.attributeName
                        ]
                    );

                    counter++;
                }
            }

            // Commit transaction
            await connection.commit();
            res.status(201).json({ message: "Data inserted successfully" });
        } catch (error) {
            if (connection) await connection.rollback();
            console.error(error);
            res.status(500).json({ message: "An error occurred", error: error.message });
        } finally {
            if (connection) connection.release();
        }
    }
);









const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
