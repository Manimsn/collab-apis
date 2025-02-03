import { z } from "zod";

// Validation for sending an invite
export const inviteSchema = z.object({
  email: z.string().email("Invalid email format"),
  role: z.enum(["ADMIN", "VIEWER", "EDITOR", "COMMENTER"]),
});

// Validation for accepting an invite
export const acceptInviteSchema = z.object({
  token: z.string().uuid("Invalid invite token"),
});
