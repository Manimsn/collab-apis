import { createFilesWithPostSchema } from "../../validations/fileFolderValidation.js";
// import * as fileFolderService from "../../services/fileFolderService.js";
// import mongoose from "mongoose";

import Post from "../../models/postModel.js";
import FileFolder from "../../models/fileFolderModel.js";

export const createFilesWithPost = async (req, res) => {
  try {
    const userId = req.user.userId; // Extract userId from token
    const validatedData = createFilesWithPostSchema.safeParse({
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
      parentFolderId,
      projectId,
      category,
      createdBy,
      description,
      files,
    } = validatedData.data;
    console.log(validatedData.data);

    // ✅ Create a new Post record
    const newPost = new Post({
      createdBy,
      projectId,
      category,
      description,
    });

    await newPost.save();

    // ✅ Create multiple FileFolder records with postId reference
    const filesWithPostId = files.map((file) => ({
      ...file,
      parentFolderId,
      projectId,
      category,
      postId: newPost._id, // Assign newly created postId
      createdBy, // Assign `createdBy` from JWT token
    }));

    const result = await FileFolder.insertMany(filesWithPostId);
    console.log("result", result);

    res.status(201).json({
      message: "Files/Folders created successfully",
      postId: newPost._id,
      files: result.map((f) => f._id),
    });
  } catch (error) {
    console.error("Error creating files/folders with post:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// export const updateFileFolder = async (req, res) => {
//   try {
//     const { id } = req.params;
//     if (!mongoose.Types.ObjectId.isValid(id))
//       return res.status(400).json({ message: "Invalid ID format" });

//     const validatedData = fileFolderArraySchema.safeParse([req.body]);
//     if (!validatedData.success) {
//       return res.status(400).json({
//         message: "Validation failed",
//         errors: validatedData.error.format(),
//       });
//     }

//     const updatedFileFolder = await fileFolderService.updateFileFolder(
//       id,
//       validatedData.data[0]
//     );
//     if (!updatedFileFolder)
//       return res.status(404).json({ message: "File/Folder not found" });

//     res.status(200).json({
//       message: "File/Folder updated successfully",
//       id: updatedFileFolder._id,
//     });
//   } catch (error) {
//     console.error("Error updating file/folder:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };
