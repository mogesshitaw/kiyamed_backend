// models/importantDatesModel.js
import pool from "../config/db.js";

// Create important date
export const createImportantDate = async ({ intake_name, event_name, event_date, description }) => {
  const [result] = await pool.query(
    `INSERT INTO important_dates (intake_name, event_name, event_date, description)
     VALUES (?, ?, ?, ?)`,
    [intake_name, event_name, event_date, description]
  );
  return result;
};

// Get all important dates
export const getAllImportantDates = async () => {
  const [rows] = await pool.query(`
    SELECT * FROM important_dates
    ORDER BY intake_name, event_date ASC
  `);
  return rows;
};

// Get important dates by intake
export const getDatesByIntake = async (intake_name) => {
  const [rows] = await pool.query(
    `SELECT * FROM important_dates 
     WHERE intake_name = ? 
     ORDER BY event_date ASC`,
    [intake_name]
  );
  return rows;
};

// Get one by ID
export const getImportantDateById = async (id) => {
  const [rows] = await pool.query(
    `SELECT * FROM important_dates WHERE id = ? LIMIT 1`,
    [id]
  );
  return rows.length ? rows[0] : null;
};

// Update
export const updateImportantDate = async (id, { intake_name, event_name, event_date, description }) => {
  const [result] = await pool.query(
    `UPDATE important_dates 
     SET intake_name = ?, event_name = ?, event_date = ?, description = ? 
     WHERE id = ?`,
    [intake_name, event_name, event_date, description, id]
  );
  return result;
};

// Delete
export const deleteImportantDate = async (id) => {
  const [result] = await pool.query(`DELETE FROM important_dates WHERE id = ?`, [id]);
  return result;
};
