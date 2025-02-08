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
