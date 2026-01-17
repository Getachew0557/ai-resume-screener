const mysql = require('mysql2/promise');
require('dotenv').config();

const { DB_HOST, DB_USER, DB_PASSWORD, DB_PORT } = process.env;

const initializeDatabase = async () => {
    try {
        const connection = await mysql.createConnection({
            host: DB_HOST || 'localhost',
            user: DB_USER || 'root',
            password: DB_PASSWORD,
            port: DB_PORT || 3306,
        });

        await connection.query(`CREATE DATABASE IF NOT EXISTS attendance_db;`);
        console.log('Database "attendance_db" created/verified successfully');
        await connection.end();
    } catch (error) {
        console.error('Error creating database:', error);
        process.exit(1);
    }
};

module.exports = initializeDatabase;
