// models/categoryModel.js
import pool from "../config/db.js";

export const createCategory = async ({ name }) => {
  const [result] = await pool.query("INSERT INTO categories (name) VALUES (?)", [name]);
  return result;
};

export const getAllCategories = async () => {
  const [rows] = await pool.query("SELECT * FROM categories ORDER BY id DESC");
  return rows;
};

export const getCategoryById = async (id) => {
  const [rows] = await pool.query("SELECT * FROM categories WHERE id = ? LIMIT 1", [id]);
  return rows.length ? rows[0] : null;
};

export const updateCategory = async (id, { name }) => {
  const [result] = await pool.query("UPDATE categories SET name = ? WHERE id = ?", [name, id]);
  return result;
};

export const deleteCategory = async (id) => {
  await pool.query("DELETE FROM news WHERE category_id = ?", [id]);
  const [result] = await pool.query("DELETE FROM categories WHERE id = ?", [id]);
  return result;
};
