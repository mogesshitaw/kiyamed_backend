// models/categoryModel.js
import pool from "../config/db.js";

export const createFeadback =  async (req, res) => {
 
  try {
    const { name, email, category, message, allow_contact } = req.body;

    if (!name || !email || !message)
      return res.status(400).json({ message: "All required fields must be filled" });

    const conn = await pool.getConnection();
    await conn.query(
      "INSERT INTO feedback (name, email, category, message, allow_contact) VALUES (?, ?, ?, ?, ?)",
      [name, email, category, message, allow_contact ? 1 : 0]
    );
    conn.release();

    res.status(201).json({ message: "Feedback submitted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error saving feedback" });
  }
}

export const getFeadback= async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.query("SELECT * FROM feedback ORDER BY created_at DESC");
    res.json(rows);
    conn.release();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching feedback" });
  }
}

export const deleteComment = async (req, res) => {
  try {
    const {id} = req.params;
    const conn = await pool.getConnection();
    const [result] = await conn.query("DELETE FROM feedback WHERE id=?",[id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: "messege not found" });
    res.json({ message: "message  deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};