import express from "express";
import {
  createProject,
  getAccessList,
  getOneProject,
  getUserAllowedCategories,
  getUserProjects,
  updateProject,
} from "../controllers/project/projectController.js";
import verifyAccessToken from "../middlewares/authMiddleware.js";
import {
  sendInvite,
  acceptInvite,
  revokeInvite,
} from "../controllers/project/inviteController.js";

const router = express.Router();

// 🚀 Create Project Route
router.post("/", verifyAccessToken, createProject);

router.post("/:projectId/invite", verifyAccessToken, sendInvite);
router.post("/invite/accept", verifyAccessToken, acceptInvite);
router.delete("/:projectId/invite", verifyAccessToken, revokeInvite);
router.put("/:projectId", verifyAccessToken, updateProject);
router.get("/user-project-mapping", verifyAccessToken, getAccessList);
router.get("/", verifyAccessToken, getUserProjects);
router.get(
  "/categorylist/:projectId",
  verifyAccessToken,
  getUserAllowedCategories
);
router.get("/:projectId", verifyAccessToken, getOneProject);

export default router;
