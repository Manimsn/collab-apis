import express from "express";
import {
  fetchPostFolderHierarchy,
  getFilesByProjectAndCategory,
  updateFilesParentFolder,
} from "../../controllers/posts/postFolderController.js";

const router = express.Router();

router.get("/", fetchPostFolderHierarchy);
router.put("/files/move-to-folder", updateFilesParentFolder);
router.get("/filefolders", getFilesByProjectAndCategory);

export default router;
