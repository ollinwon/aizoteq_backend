CREATE TABLE Users (
    id VARCHAR(255) PRIMARY KEY,
    userName VARCHAR(255) NOT NULL,
    jwtsub VARCHAR(255) UNIQUE,
    userRole VARCHAR(255),
    lastModified TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Things (
    id VARCHAR(255) PRIMARY KEY,
    thingName VARCHAR(255) UNIQUE NOT NULL,
    createdBy VARCHAR(255),  -- User who created the thing
    batchId VARCHAR(255),    -- Remains here for Things
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    model VARCHAR(255),
    serialno VARCHAR(255),
    type VARCHAR(255),
    lastModified TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table to store attributes of things
CREATE TABLE ThingAttributes (
    id SERIAL PRIMARY KEY,
    thingId VARCHAR(255),
    attributeName VARCHAR(255),  -- eg 'light' ,'fan' , 'plug' , 'trm'
    attributeValue VARCHAR(255), --eg '1' , '2' , '3' , '4'
    lastModified TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (thingId) REFERENCES Things(id)
);

-- Table to store device information
CREATE TABLE Devices (
    id VARCHAR(255) PRIMARY KEY,
    thingId VARCHAR(255),    -- Foreign key linking Devices to Things
    deviceId VARCHAR(255) NOT NULL UNIQUE,
    macAddress VARCHAR(255),
    securityKey VARCHAR(255),
    hubIndex VARCHAR(255),
    roomId VARCHAR(255),
    createdBy VARCHAR(255),
    enable BOOLEAN,
    status VARCHAR(255) CHECK (status IN ('new', 'returned', 'rework', 'exchange')), -- Status of the device
    icon VARCHAR(255),
    name VARCHAR(255),
    type VARCHAR(255),
    lastModified TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (thingId) REFERENCES Things(id),
    FOREIGN KEY (roomId) REFERENCES Rooms(id)
);

-- Table to store admin stock information
CREATE TABLE AdminStock (
    id SERIAL PRIMARY KEY,
    thingId VARCHAR(255),
    addedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    addedBy VARCHAR(255), -- User who added the device to AdminStock probably hardware staff
    status VARCHAR(255) CHECK (status IN ('new', 'returned', 'rework', 'exchange')), -- Status of the device in stock
    FOREIGN KEY (deviceId) REFERENCES Devices(id),
    FOREIGN KEY (addedBy) REFERENCES Users(id)
);
