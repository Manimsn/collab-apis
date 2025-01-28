import express from "express";
import { handleResetPassword } from "../controllers/authController.js";

const router = express.Router();

router.post("/reset-password", handleResetPassword);

export default router;
