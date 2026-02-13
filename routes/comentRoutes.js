
import express from "express";
import { createFeadback,getFeadback,deleteComment } from "../controllers/comentController.js";

const router = express.Router();

router.post("/", createFeadback);
router.get("/", getFeadback);
router.delete("/:id", deleteComment);

export default router;
