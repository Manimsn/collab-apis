import express from "express";
import {
  createPostOrFolder,
  fetchPosts,
  getPostsAndFolders,
  getPostsByProjectId,
  renamePostOrFolder,
  updateParentFolderId,
  updatePostFolder,
  updatePostStatus,
} from "../controllers/posts/postController.js";
// import { updatePostStatus } from "../controllers/posts/updatePostStatus.js";
// import verifyAccessToken from "../middlewares/authMiddleware.js";

const router = express.Router();

// router.post("/", createFilesWithPost); // Bulk create
// router.post("/", createFilesWithPost); // Bulk create
router.post("/", createPostOrFolder);
router.put("/move-items", updateParentFolderId);
// router.put("/:postId", updatePost);
router.put("/:postId", updatePostFolder);
router.put("/:postId/status", updatePostStatus);
router.get("/posts-folders", getPostsAndFolders);
router.put("/rename/:postId", renamePostOrFolder);
router.get("/:projectId", getPostsByProjectId);
router.get("/:projectId", getPostsByProjectId);
router.get("/api/posts", fetchPosts);

export default router;
