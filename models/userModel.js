// models/userModel.js
import pool from "../config/db.js";

export const createUser = async ({ username,email, password, role = "admin" }) => {
  const [result] = await pool.query("INSERT INTO users (username,email, password, role) VALUES (?, ?, ?,?)", [
    username,
    email,
    password,
    role,
  ]);
  return result;
};

export const findByUsername = async (username) => {
  const [rows] = await pool.query("SELECT * FROM users WHERE username = ? LIMIT 1", [username]);
  return rows.length ? rows[0] : null;
};
export const findByEmail = async (email) => {
  const [rows] = await pool.query("SELECT * FROM users WHERE email = ? LIMIT 1", [email]);
  return rows.length ? rows[0] : null;
};
export const findById = async (id) => {
  const [rows] = await pool.query("SELECT id, username, role FROM users WHERE id = ? LIMIT 1", [id]);
  return rows.length ? rows[0] : null;
};
