import { z } from "zod";

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
