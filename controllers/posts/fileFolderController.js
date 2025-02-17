import { createFilesWithPostSchema } from "../../validations/fileFolderValidation.js";
import { updatePostSchema } from "../../validations/postValidation.js";

import Post from "../../models/postModel.js";
import FileFolder from "../../models/fileFolderModel.js";

import { updatePostWithFiles } from "../../services/postService.js";
import { isUserAuthorized } from "../../middlewares/authorizationService.js";

// REMOVE
// we have create a new one
// export const createFilesWithPost = async (req, res) => {
//   try {
//     const userId = req.user.userId; // Extract userId from token
//     const validatedData = createFilesWithPostSchema.safeParse({
//       ...req.body,
//       createdBy: userId, // Inject `createdBy` from token
//     });

//     if (!validatedData.success) {
//       return res.status(400).json({
//         message: "Validation failed",
//         errors: validatedData.error.format(),
//       });
//     }

//     const {
//       parentFolderId,
//       projectId,
//       category,
//       createdBy,
//       description,
//       files,
//     } = validatedData.data;

//     // ✅ Create a new Post record
//     const newPost = new Post({
//       createdBy,
//       projectId,
//       category,
//       description,
//     });

//     await newPost.save();

//     // ✅ Create multiple FileFolder records with postId reference
//     const filesWithPostId = files.map((file) => ({
//       ...file,
//       parentFolderId,
//       projectId,
//       category,
//       postId: newPost._id, // Assign newly created postId
//       createdBy, // Assign `createdBy` from JWT token
//     }));

//     const result = await FileFolder.insertMany(filesWithPostId);

//     res.status(201).json({
//       message: "Files/Folders created successfully",
//       postId: newPost._id,
//       files: result.map((f) => f._id),
//     });
//   } catch (error) {
//     console.error("Error creating files/folders with post:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };

export const updatePost = async (req, res) => {
  try {
    const userId = req.user.userId;
    const email = req.user.email;
    const postId = req.params.postId;

    // Validate request payload using Zod
    const validatedData = updatePostSchema.safeParse(req.body);
    if (!validatedData.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validatedData.error.format(),
      });
    }

    const { description, taggedUsers, files, projectId, category } =
      validatedData.data;

    // Fetch file IDs from files array
    const fileIds = files ? files.map((f) => f._id) : [];

    // Authorization check
    const isAuthorized = await isUserAuthorized(
      userId,
      email,
      projectId,
      category,
      fileIds,
      true
    );

    if (!isAuthorized) {
      return res
        .status(403)
        .json({ message: "Unauthorized to update this post" });
    }

    // Call service function
    const result = await updatePostWithFiles(postId, {
      description,
      taggedUsers,
      files,
    });

    return res.status(result.status).json({ message: result.message });
  } catch (error) {
    console.error("Update Post Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
