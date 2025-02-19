import express from "express";
import { fetchPostFolderHierarchy } from "../../controllers/posts/postFolderController.js";

const router = express.Router();

router.get("/", fetchPostFolderHierarchy);

export default router;
