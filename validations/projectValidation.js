import { z } from "zod";

// Define Zod schema for validation
export const projectSchema = z.object({
  name: z.string().min(3, "Project name must be at least 3 characters long"),
  description: z.string().optional(),
  location: z.string().min(3, "Location must be at least 3 characters long"),
});

// Define Zod schema for update validation
export const updateProjectSchema = z
  .object({
    name: z
      .string()
      .min(3, "Project name must be at least 3 characters long")
      .optional(),
    description: z.string().optional(),
    location: z
      .string()
      .min(3, "Location must be at least 3 characters long")
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message:
      "At least one field (name, description, or location) must be provided.",
  });
