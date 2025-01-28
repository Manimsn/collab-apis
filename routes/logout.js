import express from "express";
import { handleLogout } from "../controllers/logoutController.js";

const router = express.Router();

// Add the logout route
router.get("/", handleLogout);

export default router;
