import { z } from "zod";
import mongoose from "mongoose";
import { categoryEnum } from "../config/constants.js";

// MongoDB ObjectId Validation
const objectIdValidator = z
  .string()
  .refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid ObjectId format",
  });

const parentFolderIdValidator = z
  .string()
  .refine((val) => val === "ROOT" || mongoose.Types.ObjectId.isValid(val), {
    message: "parentFolderId must be 'ROOT' or a valid ObjectId",
  });

// Category Enum Validation
const categorySchema = z.enum(categoryEnum);

export const createFilesWithPostSchema = z.object({
  parentFolderId: parentFolderIdValidator, // ROOT or ObjectId
  projectId: objectIdValidator, // Must be a valid ObjectId
  category: categorySchema, // Must be from categoryEnum
  createdBy: objectIdValidator, // Must be a valid ObjectId (extracted from JWT)
  description: z.string().optional(),
  files: z.array(
    z
      .object({
        type: z.enum(["file", "folder"]),
        name: z.string().min(1, "Name is required"),
        fileType: z.string().optional(), // Initially optional, enforced below
        description: z.string().optional(),
      })
      .superRefine((file, ctx) => {
        if (
          file.type === "file" &&
          (!file.fileType || file.fileType.trim() === "")
        ) {
          ctx.addIssue({
            path: ["fileType"],
            message: "fileType is required when type is 'file'",
            code: "custom",
          });
        }
      })
  ),
});

// ✅ Zod schema for validating request payload
export const fetchPostFolderSchema = z.object({
  projectId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid projectId",
  }),
  category: z.string().min(1, "Category is required"),
});

// Zod schema for request validation
export const updateParentFolderSchema = z
  .object({
    parentFolderId: z
      .string()
      .refine((id) => mongoose.Types.ObjectId.isValid(id), {
        message: "Invalid parentFolderId",
      }),

    files: z
      .array(
        z.object({
          _id: z.string().refine((id) => mongoose.Types.ObjectId.isValid(id), {
            message: "Invalid fileId",
          }),
          postId: z
            .string()
            .refine((id) => mongoose.Types.ObjectId.isValid(id), {
              message: "Invalid postId",
            }),
        })
      )
      .optional(), // Optional but needs at least one item if provided

    folderAndLinks: z
      .array(
        z.string().refine((id) => mongoose.Types.ObjectId.isValid(id), {
          message: "Invalid _id in folderAndLinks",
        })
      )
      .optional(), // Optional but needs at least one item if provided
  })
  .refine(
    (data) =>
      (data.files?.length ?? 0) > 0 || (data.folderAndLinks?.length ?? 0) > 0,
    {
      message:
        "Either files or folderAndLinks must be provided with at least one item",
      path: ["files", "folderAndLinks"],
    }
  );

// Validation schema for request params
export const fileAccessSchema = z.object({
  projectId: z.string().min(1, "projectId is required"), // Ensure non-empty string
  category: z.string().min(1, "category is required"), // Ensure non-empty string
  fileOrFolderId: z.string().min(1, "fileOrFolderId is required"), // Ensure non-empty string
});
