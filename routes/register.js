import express from "express";
import { handleNewUser } from "../controllers/auth/registerController.js"; // Use ESM import

const router = express.Router();

router.post("/", handleNewUser);

export default router; // Use ESM export
