const express=require('express');
const signup=express.Router();
const db = require('./dbconnection');
const AWS=require('aws-sdk');
require('dotenv').config();
signup.use(express.json());
const crypto = require('crypto');

// Your Cognito App client ID and secret
const clientId = process.env.clientId;
const clientSecret = process.env.clientSecret;

// Function to calculate the SECRET_HASH
function calculateSecretHash(username) {
    const hmac = crypto.createHmac('sha256', clientSecret);
    hmac.update(username + clientId); // The hash is the username + clientId
    return hmac.digest('base64'); // Return the base64-encoded hash
}
const cognito = new AWS.CognitoIdentityServiceProvider({
    region: process.env.COGNITO_REGION, // Adjust to your region
});



signup.post('app/customer/signup', async (req, res) => {
    const { userName, password, email, phoneNumber, fullName } = req.body;
    const secretHash = calculateSecretHash(userName);
    if (!userName || !password || !email) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

     // Assuming these values are coming from the request body

const params = {
    ClientId: process.env.clientId,  // Replace with your Cognito app client ID
    Username: userName,
    Password: password,
    UserAttributes: [
        { Name: 'email', Value: email }, // Email is required
        { Name: 'given_name', Value: userName }, // Name attribute
        { Name: 'phone_number', Value: phoneNumber }, // Add phone number
        { Name: 'name', Value: fullName }, // Full name attribute (You can use formatted name if needed)
    ],
    SecretHash: secretHash,  // Add the calculated SECRET_HASH here
};

    try {
        // Sign up the user in Cognito
        const signUpResponse = await cognito.signUp(params).promise();
        const jwtsub = signUpResponse.UserSub; // The unique identifier for the user in Cognito

        // Insert user details into MySQL database
        const query = 'INSERT INTO Users (id, userName, jwtsub, userRole) VALUES (?, ?, ?, ?)';
        db.query(query, [jwtsub, userName, jwtsub, 'customer'], (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Error storing user in database', error: err.message });
            }

            res.status(201).json({
                message: 'User signed up successfully',
                userSub: jwtsub,
            });
        });
    } catch (err) {
        res.status(500).json({ message: 'Error during Cognito sign-up', error: err.message });
    }
});

signup.post('app/staff/signup', async (req, res) => {
    
    const { userName, password, email, phoneNumber, fullName } = req.body;
    const secretHash = calculateSecretHash(userName);
    if (!userName || !password || !email) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

     // Assuming these values are coming from the request body

const params = {
    ClientId: process.env.clientId,  // Replace with your Cognito app client ID
    Username: userName,
    Password: password,
    UserAttributes: [
        { Name: 'email', Value: email }, // Email is required
        { Name: 'given_name', Value: userName }, // Name attribute
        { Name: 'phone_number', Value: phoneNumber }, // Add phone number
        { Name: 'name', Value: fullName }, // Full name attribute (You can use formatted name if needed)
    ],
    SecretHash: secretHash,  // Add the calculated SECRET_HASH here
};
    try {
        // Sign up the user in Cognito
        const signUpResponse = await cognito.signUp(params).promise();
        const jwtsub = signUpResponse.UserSub; // The unique identifier for the user in Cognito

        // Insert user details into MySQL database
        const query = 'INSERT INTO Users (id, userName, jwtsub, userRole) VALUES (?, ?, ?, ?)';
        db.query(query, [jwtsub, userName, jwtsub, 'staff'], (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Error storing user in database', error: err.message });
            }

            res.status(201).json({
                message: 'User signed up successfully',
                userSub: jwtsub,
            });
        });
    } catch (err) {
        res.status(500).json({ message: 'Error during Cognito sign-up', error: err.message });
    }
});

signup.post('dashboard/admin/signup', async (req, res) => {
    const { userName, password, email, phoneNumber, fullName } = req.body;
    const secretHash = calculateSecretHash(userName);
    if (!userName || !password || !email) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

     // Assuming these values are coming from the request body

const params = {
    ClientId: process.env.clientId,  // Replace with your Cognito app client ID
    Username: userName,
    Password: password,
    UserAttributes: [
        { Name: 'email', Value: email }, // Email is required
        { Name: 'given_name', Value: userName }, // Name attribute
        { Name: 'phone_number', Value: phoneNumber }, // Add phone number
        { Name: 'name', Value: fullName }, // Full name attribute (You can use formatted name if needed)
    ],
    SecretHash: secretHash,  // Add the calculated SECRET_HASH here
};

    try {
        // Sign up the user in Cognito
        const signUpResponse = await cognito.signUp(params).promise();
        const jwtsub = signUpResponse.UserSub; // The unique identifier for the user in Cognito

        // Insert user details into MySQL database
        const query = 'INSERT INTO Users (id, userName, jwtsub, userRole) VALUES (?, ?, ?, ?)';
        db.query(query, [jwtsub, userName, jwtsub, 'admin'], (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Error storing user in database', error: err.message });
            }

            res.status(201).json({
                message: 'User signed up successfully',
                userSub: jwtsub,
            });
        });
    } catch (err) {
        res.status(500).json({ message: 'Error during Cognito sign-up', error: err.message });
    }
});

signup.post('dashboard/dealer/signup', async (req, res) => {
    const { userName, password, email, phoneNumber, fullName } = req.body;
    const secretHash = calculateSecretHash(userName);

    if (!userName || !password || !email) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    const params = {
        ClientId: process.env.clientId,  // Replace with your Cognito app client ID
        Username: userName,
        Password: password,
        UserAttributes: [
            { Name: 'email', Value: email }, // Email is required
            { Name: 'given_name', Value: userName }, // Name attribute
            { Name: 'phone_number', Value: phoneNumber }, // Add phone number
            { Name: 'name', Value: fullName }, // Full name attribute (You can use formatted name if needed)
        ],
        SecretHash: secretHash,  // Add the calculated SECRET_HASH here
    };

    try {
        // Sign up the user in Cognito
        const signUpResponse = await cognito.signUp(params).promise();
        const jwtsub = signUpResponse.UserSub; // The unique identifier for the user in Cognito

        // Insert user details into MySQL database
        const query = 'INSERT INTO Users (id, userName, jwtsub, userRole) VALUES (?, ?, ?, ?)';
        db.query(query, [jwtsub, userName, jwtsub, 'dealer'], (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Error storing user in database', error: err.message });
            }

            res.status(201).json({
                message: 'User signed up successfully',
                userSub: jwtsub,
            });
        });
    } catch (err) {
        res.status(500).json({ message: 'Error during Cognito sign-up', error: err.message });
    }
});

module.exports=signup;
