import mysql from 'mysql2/promise';

async function initializeDatabase() {
  // const connection = await mysql.createConnection({
  // });
  const connection = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``);
  await connection.end();
}

export default initializeDatabase;
