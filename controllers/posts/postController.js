import { FILETYPE } from "../../config/constants.js";
import { messages } from "../../config/messages.js";
import { isUserAuthorized } from "../../middlewares/authorizationService.js";
import PostFolder from "../../models/postFolderModel.js";
import { checkProjectExists } from "../../services/inviteService.js";
import { createPostOrFolderSchema } from "../../validations/postValidation.js";

export const createPostOrFolder = async (req, res, next) => {
  try {
    const { userId, email } = req.user; // Extract userId from token

    // ✅ Validate request data
    const validatedData = createPostOrFolderSchema.safeParse({
      ...req.body,
      createdBy: userId, // Inject `createdBy` from token
    });

    if (!validatedData.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validatedData.error.format(),
      });
    }

    const {
      type, // "post" or "folder"
      name,
      parentFolderId,
      projectId,
      category,
      description,
      files,
    } = validatedData.data;

    // Fetch project and validate ownership
    const project = await checkProjectExists(projectId);
    if (!project) {
      return res.status(404).json({ message: messages.PROJECT.NOT_FOUND });
    }

    const isAuthorized = await isUserAuthorized(
      userId,
      email,
      projectId,
      null,
      null,
      false
    );

    if (!isAuthorized) {
      return res
        .status(403)
        .json({ message: "Unauthorized to create this post" });
    }

    // ✅ If `parentFolderId` exists, validate that it refers to an existing folder
    if (parentFolderId) {
      const parentFolder = await PostFolder.findById({ _id: parentFolderId });

      if (!parentFolder) {
        return res.status(400).json({ message: "Parent folder not found." });
      }

      if (parentFolder.type !== FILETYPE.FOLDER) {
        return res
          .status(400)
          .json({ message: "Parent must be a folder, not a post." });
      }
    }

    // ✅ Create a new Post (as a folder or a post)
    const newPostOrFolder = new PostFolder({
      type,
      name: type === FILETYPE.FOLDER ? name : undefined, // Required for folders
      parentFolderId,
      projectId,
      category,
      createdBy: userId,
      description,
      files: type === FILETYPE.POST ? files : [], // Only posts can have files
    });

    await newPostOrFolder.save();

    res.status(201).json({
      message: `${
        type === FILETYPE.POST ? FILETYPE.POST : FILETYPE.FOLDER
      } created successfully`,
      postId: newPostOrFolder._id,
    });
  } catch (error) {
    console.error("Error creating post/folder:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
