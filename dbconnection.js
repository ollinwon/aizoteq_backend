const mysql = require('mysql2/promise'); // Use `mysql2/promise` for async/await support

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'aizoteqnew',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Connect to MySQL

module.exports=db;