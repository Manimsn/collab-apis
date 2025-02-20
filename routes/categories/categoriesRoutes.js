import express from "express";
import {
  fetchPostFolderHierarchy,
  updateFilesParentFolder,
} from "../../controllers/posts/postFolderController.js";

const router = express.Router();

router.get("/", fetchPostFolderHierarchy);
router.get("/files/move-to-folder", updateFilesParentFolder);

export default router;
