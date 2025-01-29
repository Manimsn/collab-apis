import express from "express";
import { handleResetPassword } from "../controllers/resetPasswordController.js";

const router = express.Router();

router.post("/", handleResetPassword);

export default router;
