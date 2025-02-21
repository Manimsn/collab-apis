import express from "express";
import {
  fetchPostFolderHierarchy,
  getFilesByProjectAndCategory,
  getUserProjectMappingById,
  getUsersWithFileAccess,
  updateFilesParentFolder,
} from "../../controllers/posts/postFolderController.js";

const router = express.Router();

router.get("/", fetchPostFolderHierarchy);
router.put("/files/move-to-folder", updateFilesParentFolder);
router.get("/filefolders", getFilesByProjectAndCategory);
router.get("/files/access", getUsersWithFileAccess);
router.get("/check/checkaccess/:id", getUserProjectMappingById);

export default router;
