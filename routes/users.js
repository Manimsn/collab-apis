import express from "express";
import {
  deleteUserMappingDetails,
  getAllUsers,
  getProjectDetails,
  getUserMappingDetails,
} from "../controllers/users/userController.js";

const router = express.Router();

router.get("/", getAllUsers);
router.get("/allprojects", getProjectDetails);
router.get("/allprojects/:projectId", getUserMappingDetails);
router.delete("/", deleteUserMappingDetails);

export default router;
