import express from "express";
import { handleRefreshToken } from "../controllers/auth/refreshTokenController.js"; // Use ESM import

const router = express.Router();

router.get("/", handleRefreshToken);

export default router; // Use ESM export
