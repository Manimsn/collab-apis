import express from "express";
// import {
//   // createFilesWithPost,
//   updatePost,
// } from "../controllers/posts/fileFolderController.js";
import {
  createPostOrFolder,
  updatePostFolder,
  // updatePostOrFolder,
} from "../controllers/posts/postController.js";
import { updatePostStatus } from "../controllers/posts/updatePostStatus.js";
// import verifyAccessToken from "../middlewares/authMiddleware.js";

const router = express.Router();

// router.post("/", createFilesWithPost); // Bulk create
// router.post("/", createFilesWithPost); // Bulk create
router.post("/", createPostOrFolder);
// router.put("/:postId", updatePost);
router.put("/:postId", updatePostFolder);
router.put("/:postId/status", updatePostStatus);

export default router;
