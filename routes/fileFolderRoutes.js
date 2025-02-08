import express from "express";
import {
  createFilesWithPost,
//   updateFileFolder,
} from "../controllers/posts/fileFolderController.js";
// import verifyAccessToken from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", createFilesWithPost); // Bulk create
// router.put("/:id", updateFileFolder);

export default router;
