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
      isBlocker,
      isFeed,
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
      isBlocker,
      isFeed,
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
  let session;
  try {
    const { userId, email } = req.user;
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
    const updateFields = {};
    console.log("parsedBody", parsedBody);

    if (parsedBody.description?.trim()) {
      updateFields.description = parsedBody.description.trim();
    }
    if (parsedBody.isBlocker) {
      updateFields.isBlocker = parsedBody.isBlocker;
    }
    if (parsedBody.isFeed) {
      updateFields.isFeed = parsedBody.isFeed;
    }

    if (parsedBody.taggedUsers?.length) {
      updateFields.taggedEmails = parsedBody.taggedUsers;
    }

    // Start transaction only if not running in test environment
    if (process.env.NODE_ENV !== "test") {
      session = await mongoose.startSession();
      session.startTransaction();
    }

    // Fetch the existing post
    const post = await PostFolder.findById(postId).session(
      session || undefined
    );
    if (!post) {
      if (session) {
        await session.abortTransaction();
        session.endSession();
      }
      return res.status(404).json({ error: "Post not found" });
    }

    // if (userId !== post.createdBy) {
    //   return res.status(403).json({ error: "Only owner of the post can edit" });
    // }

    // ✅ STEP 1: Handle file deletions separately
    if (parsedBody.deleteFileIds) {
      post.files = post.files.filter(
        (file) => !parsedBody.deleteFileIds.includes(file._id.toString())
      );
      await post.save({ session: session || undefined }); // Save after deletion
    }

    // ✅ STEP 2: Handle updating existing files separately
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
      await post.save({ session: session || undefined }); // Save after updates
    }

    // ✅ STEP 3: Handle adding new files separately
    if (parsedBody.newUploadedFiles) {
      if (post.type !== "POST") {
        if (session) {
          await session.abortTransaction();
          session.endSession();
        }
        return res.status(400).json({
          error: "Files can only be added to a post, not a folder",
        });
      }
      if (post.files.length + parsedBody.newUploadedFiles.length > 20) {
        if (session) {
          await session.abortTransaction();
          session.endSession();
        }
        return res.status(400).json({
          error: "A post cannot have more than 20 files",
        });
      }
      post.files.push(...parsedBody.newUploadedFiles);
      await post.save({ session: session || undefined }); // Save after adding files
    }

    // Apply other field updates
    const updatedPost = await PostFolder.findByIdAndUpdate(
      postId,
      { $set: updateFields },
      { new: true, session: session || undefined }
    );

    // Commit transaction if it was started
    if (session) {
      await session.commitTransaction();
      session.endSession();
    }

    return res
      .status(200)
      .json({ message: "Post updated successfully", post: updatedPost });
  } catch (error) {
    console.error("Update Error:", error);
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }
    return res.status(500).json({ error: error.message });
  }
};
