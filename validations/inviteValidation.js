import { z } from "zod";
import { categoryEnum } from "../config/constants.js";

const categorySchema = z.enum(categoryEnum);

// Validation for sending an invite
export const inviteSchema = z
  .object({
    email: z.string().email("Invalid email format"),
    role: z.enum(["ADMIN", "VIEWER", "EDITOR", "COMMENTER"]),
    category: categorySchema.optional(),
  })
  .refine((data) => !(data.category && data.role === "ADMIN"), {
    message: "ADMIN role is not allowed for category-level access.",
    path: ["role"],
  });

// Validation for accepting an invite
export const acceptInviteSchema = z.object({
  token: z.string().uuid("Invalid invite token"),
});
