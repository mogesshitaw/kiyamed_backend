import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS, // Using DB_PASS as in your env
  database: process.env.DB_NAME,
  port: parseInt(process.env.PORT) || 18944, // Using PORT from your env
  connectionLimit: 10,
  connectTimeout: 60000,
  ssl: {
    rejectUnauthorized: false // Aiven usually needs this
  }
});

export default pool;