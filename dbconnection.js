const mysql = require('mysql2/promise'); // Use `mysql2/promise` for async/await support

const db = mysql.createPool({
    host: 'srv1128.hstgr.io',
    user: 'u909315693_aizoteqnew',
    password: 'Ollinwon@123',
    database: 'u909315693_aizoteqnew',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Connect to MySQL

module.exports=db;
