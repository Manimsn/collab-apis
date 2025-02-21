import express from "express";
import { handleResetPassword } from "../controllers/auth/resetPasswordController.js";

const router = express.Router();

router.post("/", handleResetPassword);

export default router;
