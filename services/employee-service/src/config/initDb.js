import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function initializeDatabase() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD
        });

        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``);
        console.log(`Database "${process.env.DB_NAME}" verified/created.`);
        await connection.end();
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }
}

export default initializeDatabase;
