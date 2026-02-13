// controllers/categoryController.js
import {
  createCategory as createCategoryModel,
  getAllCategories,
  getCategoryById,
  updateCategory as updateCategoryModel,
  deleteCategory as deleteCategoryModel,
} from "../models/categoryModel.js";

export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Category name required" });
    const result = await createCategoryModel({ name });
    res.status(201).json({ message: "Category created", id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

export const getCategories = async (req, res) => {
  try {
    const rows = await getAllCategories();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

export const getCategory = async (req, res) => {
  try {
    const id = req.params.id;
    const row = await getCategoryById(id);
    if (!row) return res.status(404).json({ message: "Category not found" });
    res.json(row);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const id = req.params.id;
    const { name } = req.body;
    const result = await updateCategoryModel(id, { name });
    if (result.affectedRows === 0) return res.status(404).json({ message: "Category not found" });
    res.json({ message: "Category updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await deleteCategoryModel(id);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Category not found" });
    res.json({ message: "Category deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
