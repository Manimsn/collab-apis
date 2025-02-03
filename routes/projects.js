import express from "express";
import { createProject } from "../controllers/projectController.js";
import verifyAccessToken from "../middlewares/authMiddleware.js";
import {
  sendInvite,
  acceptInvite,
  revokeInvite,
} from "../controllers/inviteController.js";

const router = express.Router();

// 🚀 Create Project Route
router.post("/", verifyAccessToken, createProject);

router.post("/:projectId/invite", verifyAccessToken, sendInvite);
router.post("/invite/accept", verifyAccessToken, acceptInvite);
router.delete("/:projectId/invite", verifyAccessToken, revokeInvite);

export default router;
