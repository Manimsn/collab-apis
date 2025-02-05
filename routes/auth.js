import express from "express";
import { handleLogin } from "../controllers/auth/authController.js";

const router = express.Router();

router.post("/", handleLogin);

export default router;
