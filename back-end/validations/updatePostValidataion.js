import { z } from "zod";

// MongoDB ObjectId validation regex
const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId format");

const existingFileSchema = z
  .object({
    _id: objectIdSchema,
    name: z.string().optional(),
    fileType: z.string().optional(),
    description: z.string().optional(),
  })
  .refine((data) => data.name || data.description, {
    message:
      "Either 'name' or 'description' is required when '_id' is present.",
  });

const newFileSchema = z.object({
  name: z.string(),
  fileType: z.string(),
  description: z.string().optional(),
});

export const updateNewPostSchema = z
  .object({
    taggedUsers: z.array(z.string().email()).optional(), // Valid email validation
    description: z
      .string()
      .min(5, { message: "Must be at least 5 characters long" })
      .optional(),
    isBlocker: z.boolean().optional(),
    isFeed: z.boolean().optional(),
    deleteFileIds: z
      .array(objectIdSchema)
      .min(
        1,
        "At least one valid ObjectId must be provided in deleteFileIds if specified"
      )
      .optional(),

    newUploadedFiles: z
      .array(newFileSchema)
      .min(1, "At least one file is required if 'newUploadedFiles' exists")
      .optional(),

    existingFiles: z
      .array(existingFileSchema)
      .min(1, "At least one file is required if 'existingFiles' exists")
      .optional(),
  })
  .refine(
    (data) =>
      data.description ||
      (data.taggedUsers && data.taggedUsers.length) ||
      (data.existingFiles && data.existingFiles.length) ||
      (data.newUploadedFiles && data.newUploadedFiles.length) ||
      (data.deleteFileIds && data.deleteFileIds.length),
    {
      message:
        "At least one field (description, taggedUsers, existingFiles, newUploadedFiles, or deleteFileIds) must be provided.",
    }
  );
