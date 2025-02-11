import express from "express";
import {
  // createFilesWithPost,
  updatePost,
} from "../controllers/posts/fileFolderController.js";
import { createPostOrFolder } from "../controllers/posts/postController.js";
// import verifyAccessToken from "../middlewares/authMiddleware.js";

const router = express.Router();

// router.post("/", createFilesWithPost); // Bulk create
// router.post("/", createFilesWithPost); // Bulk create
router.post("/", createPostOrFolder);
router.put("/:postId", updatePost);

export default router;
