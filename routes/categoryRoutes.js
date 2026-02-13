// routes/categoryRoutes.js
import express from "express";
import {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import { authenticateToken, authorizeAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getCategories);
router.get("/:id", getCategory);

// Protected admin routes
router.post("/", authenticateToken, authorizeAdmin, createCategory);
router.put("/:id", authenticateToken, authorizeAdmin, updateCategory);
router.delete("/:id", authenticateToken, authorizeAdmin, deleteCategory);

export default router;
