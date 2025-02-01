import express from "express";
import { createProject } from "../controllers/projectController.js";
import verifyAccessToken from "../middlewares/authMiddleware.js";

const router = express.Router();

// 🚀 Create Project Route
router.post("/", verifyAccessToken, createProject);

export default router;
