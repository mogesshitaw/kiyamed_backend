// routes/importantDatesRoutes.js
import express from "express";
import * as ImportantDatesController from "../controllers/importantDatesController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", ImportantDatesController.getAllDates);
router.get("/intake/:intake_name", ImportantDatesController.getDatesByIntake);
router.get("/:id", ImportantDatesController.getDateById);

// Protected routes (admin only)
router.post("/", verifyToken, ImportantDatesController.createDate);
router.put("/:id", verifyToken, ImportantDatesController.updateDate);
router.delete("/:id", verifyToken, ImportantDatesController.deleteDate);

export default router;
