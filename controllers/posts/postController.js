import { FILETYPE } from "../../config/constants.js";
import { messages } from "../../config/messages.js";
import { isUserAuthorized } from "../../middlewares/authorizationService.js";
import PostFolder from "../../models/postFolderModel.js";
import { checkProjectExists } from "../../services/inviteService.js";
import { createPostOrFolderSchema } from "../../validations/postValidation.js";
import { updateNewPostSchema } from "../../validations/updatePostValidataion.js";
import mongoose from "mongoose";

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
    // console.error("Error creating post/folder:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updatePostFolder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { userId, email } = req.user; // Extract userId from token
    const { postId } = req.params;

    // Validate `postId`
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ error: "Invalid postId format" });
    }

    // Validate request body with Zod
    const validationResult = updateNewPostSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validationResult.error.format(),
      });
    }

    const parsedBody = validationResult.data;
    console.log("Parsed Body:", parsedBody);

    const updateFields = {};

    if (parsedBody.description?.trim()) {
      updateFields.description = parsedBody.description.trim();
    }

    if (parsedBody.taggedUsers?.length) {
      console.log("Updating taggedEmails:", parsedBody.taggedUsers);
      updateFields.taggedEmails = parsedBody.taggedUsers;
    }

    // Fetch the existing post
    const post = await PostFolder.findById(postId).session(session);
    console.log("Fetched Post:", post);

    if (!post) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: "Post not found" });
    }

    // Handle new file uploads
    if (parsedBody.newUploadedFiles) {
      if (post.type !== "POST") {
        await session.abortTransaction();
        session.endSession();
        return res
          .status(400)
          .json({ error: "Files can only be added to a post, not a folder" });
      }
      if (post.files.length + parsedBody.newUploadedFiles.length > 20) {
        await session.abortTransaction();
        session.endSession();
        return res
          .status(400)
          .json({ error: "A post cannot have more than 20 files" });
      }
      post.files.push(...parsedBody.newUploadedFiles);
    }

    // Handle updating existing files
    if (parsedBody.existingFiles) {
      parsedBody.existingFiles.forEach((updatedFile) => {
        const fileIndex = post.files.findIndex(
          (file) => file._id.toString() === updatedFile._id
        );
        if (fileIndex !== -1) {
          post.files[fileIndex] = {
            ...post.files[fileIndex].toObject(),
            ...updatedFile,
          };
        }
      });
    }

    // Handle file deletions
    if (parsedBody.deleteFileIds) {
      post.files = post.files.filter(
        (file) => !parsedBody.deleteFileIds.includes(file._id.toString())
      );
    }

    // Apply the field updates
    await PostFolder.findByIdAndUpdate(
      postId,
      { $set: updateFields },
      { session }
    );

    // Save the updated document
    await post.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({ message: "Post updated successfully", post });
  } catch (error) {
    console.error("Update Error:", error);
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ error: error.message });
  }
};
