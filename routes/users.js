import express from "express";
import { getAllUsers } from "../controllers/users/userController.js";

const router = express.Router();

router.get("/", getAllUsers);

export default router;
