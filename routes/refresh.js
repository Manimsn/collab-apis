import express from "express";
import { handleRefreshToken } from "../controllers/refreshTokenController.js"; // Use ESM import

const router = express.Router();

router.get("/", handleRefreshToken);

export default router; // Use ESM export
