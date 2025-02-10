import { z } from "zod";
import mongoose from "mongoose";
import { categoryEnum, FileTypeEnum } from "../config/constants.js";

export const updatePostSchema = z
  .object({
    projectId: z.string(),
    category: z.string(),
    description: z.string().optional(),
    taggedUsers: z.array(z.string()).optional(),
    files: z
      .array(
        z.object({
          fileId: z.string(),
          fileName: z.string().optional(),
          description: z.string().optional(),
        })
      )
      .optional(),
  })
  .refine(
    (data) =>
      data.description || data.taggedUsers?.length || data.files?.length,
    {
      message:
        "At least one field (description, taggedUsers, or files) must be provided for update.",
    }
  );

// =-----------------------------------------

// ✅ Custom validator for ObjectId or null (for parentFolderId)
const objectIdOrNull = z
  .union([
    z
      .string()
      .length(24)
      .refine(mongoose.Types.ObjectId.isValid, "Invalid ObjectId"),
    z.null(),
  ])
  .optional();

// ✅ Enum for post/folder type
const postTypeEnum = z.enum(FileTypeEnum);

// ✅ Updated categoryEnum
const categoryEnumS = z.enum(categoryEnum);

// ✅ Validation for a single file
const fileSchema = z.object({
  name: z.string().min(1, "File name is required"),
  fileType: z.string().min(1, "File type is required"),
  description: z.string().optional(),
});

// ✅ Validation for creating a post or folder
export const createPostOrFolderSchema = z
  .object({
    type: postTypeEnum,
    name: z.string().min(1, "Folder name is required").optional(), // Required only for folders
    parentFolderId: objectIdOrNull, // Must be null or a valid ObjectId
    projectId: z
      .string()
      .length(24)
      .refine(mongoose.Types.ObjectId.isValid, "Invalid Project ID"),
    createdBy: z
      .string()
      .length(24)
      .refine(mongoose.Types.ObjectId.isValid, "Invalid User ID"),
    category: categoryEnumS, // Required for both post and folder
    description: z.string().optional(),
    files: z
      .array(fileSchema)
      .min(1, "At least one file is required for a post")
      .max(20, "A post cannot have more than 20 files")
      .optional(),
  })
  .refine(
    (data) => {
      // ✅ Ensure `name` is required only if type is 'folder'
      if (data.type === "folder" && !data.name) {
        return false;
      }
      return true;
    },
    {
      message: "Folder must have a name",
      path: ["name"],
    }
  )
  .refine(
    (data) => {
      // ✅ Ensure `files` can only be present if `type` is 'post'
      if (data.type === "folder" && data.files && data.files.length > 0) {
        return false;
      }
      return true;
    },
    {
      message: "Folders cannot contain files directly",
      path: ["files"],
    }
  )
  .refine(
    (data) => {
      // ✅ Ensure `files` are required if `type` is 'post'
      if (data.type === "post" && (!data.files || data.files.length === 0)) {
        return false;
      }
      return true;
    },
    {
      message: "A post must contain at least one file",
      path: ["files"],
    }
  );

// ✅ Positive Test Cases
//   {
//     "type": "folder",
//     "name": "Project Docs",
//     "parentFolderId": null,
//     "projectId": "65fd7e3d9c4a1a24b0a2f115",
//     "category": "Files"
// }

// {
//   "type": "post",
//   "parentFolderId": "65fd7e4f9c4a1a24b0a2f120",
//   "projectId": "65fd7e3d9c4a1a24b0a2f115",
//   "category": "Drawings",
//   "description": "Blueprints for building",
//   "files": [
//       {
//           "name": "blueprint.pdf",
//           "fileType": "pdf"
//       }
//   ]
// }

// {
//   "type": "post",
//   "parentFolderId": "67aa046d51c31165a64099ba",
//   "projectId": "65fd7e3d9c4a1a24b0a2f115",
//   "category": "Drawings",
//   "description": "Blueprints for building",
//   "files": [
//       {
//           "name": "blueprint.pdf",
//           "fileType": "pdf"
//       }
//   ]
// }

// ❌ Negative Test Cases
// {
//     "type": "folder",
//     "parentFolderId": null,
//     "projectId": "65fd7e3d9c4a1a24b0a2f115",
//     "category": "Files"
// }
// {
//     //"Folders cannot contain files directly"
//     "type": "folder",
//     "name": "Folder with Files",
//     "parentFolderId": null,
//     "projectId": "65fd7e3d9c4a1a24b0a2f115",
//     "category": "Files",
//     "files": [
//         {
//             "name": "file1.pdf",
//             "fileType": "pdf"
//         }
//     ]
// }
// {
//     //A post must contain at least one file
//     "type": "post",
//     "parentFolderId": "65fd7e4f9c4a1a24b0a2f120",
//     "projectId": "65fd7e3d9c4a1a24b0a2f115",
//     "category": "Drawings",
//     "description": "Missing files"
// }
// {
//     //Parent folder not found.
//     //Parent must be a folder, not a post.
//     "type": "post",
//     "parentFolderId": "65fd7e6f9c4a1a24b0a2f125",
//     "projectId": "65fd7e3d9c4a1a24b0a2f115",
//     "category": "Panoramas",
//     "files": [
//         {
//             "name": "image.jpg",
//             "fileType": "jpg"
//         }
//     ]
// }
// {
//     "type": "folder",
//     "name": "Subfolder",
//     "parentFolderId": "65fd7e6f9c4a1a24b0a2f125",
//     "projectId": "65fd7e3d9c4a1a24b0a2f115",
//     "category": "Survey"
// }
// {
//     //"String must contain exactly 24 character(s)",
//     // "Invalid ObjectId"
//     "type": "folder",
//     "name": "Invalid Folder",
//     "parentFolderId": "invalid-id",
//     "projectId": "65fd7e3d9c4a1a24b0a2f115",
//     "category": "Files"
// }
// {
//     "type": "post",
//     "parentFolderId": "65fd7e4f9c4a1a24b0a2f120",
//     "projectId": "65fd7e3d9c4a1a24b0a2f115",
//     "category": "Images",
//     "files": [
//         {
//             "name": "file1.png",
//             "fileType": "png"
//         },
//         {
//             "name": "file2.png",
//             "fileType": "png"
//         },
//         {
//             "name": "file3.png",
//             "fileType": "png"
//         },
//         {
//             "name": "file4.png",
//             "fileType": "png"
//         },
//         {
//             "name": "file5.png",
//             "fileType": "png"
//         },
//         {
//             "name": "file6.png",
//             "fileType": "png"
//         },
//         {
//             "name": "file7.png",
//             "fileType": "png"
//         },
//         {
//             "name": "file8.png",
//             "fileType": "png"
//         },
//         {
//             "name": "file9.png",
//             "fileType": "png"
//         },
//         {
//             "name": "file10.png",
//             "fileType": "png"
//         },
//         {
//             "name": "file11.png",
//             "fileType": "png"
//         },
//         {
//             "name": "file12.png",
//             "fileType": "png"
//         },
//         {
//             "name": "file13.png",
//             "fileType": "png"
//         },
//         {
//             "name": "file14.png",
//             "fileType": "png"
//         },
//         {
//             "name": "file15.png",
//             "fileType": "png"
//         },
//         {
//             "name": "file16.png",
//             "fileType": "png"
//         },
//         {
//             "name": "file17.png",
//             "fileType": "png"
//         },
//         {
//             "name": "file18.png",
//             "fileType": "png"
//         },
//         {
//             "name": "file19.png",
//             "fileType": "png"
//         },
//         {
//             "name": "file20.png",
//             "fileType": "png"
//         },
//         {
//             "name": "file21.png",
//             "fileType": "png"
//         }
//     ]
// }
