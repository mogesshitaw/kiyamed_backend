
import express from "express";
import { createAplication,getApply } from "../controllers/applyController.js";

const router = express.Router();

router.post("/", createAplication);
router.get("/", getApply);

export default router;
