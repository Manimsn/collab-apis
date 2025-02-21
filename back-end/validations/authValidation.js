import { z } from "zod";

// Validation schema for login request
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const userSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  plan: z.enum(["FREE", "BASIC", "PREMIUM"]),
  planType: z.union([z.enum(["Monthly", "Yearly"]), z.null()]).optional(), // Allow null or valid enum
  designation: z.string().optional(),
  location: z.string().optional(),
});

// Validation schema for reset password request
export const resetPasswordSchema = z.object({
  email: z.string().email(),
  newPassword: z
    .string()
    .min(8)
    .regex(/[A-Z]/, "Password must include at least one uppercase letter")
    .regex(/[0-9]/, "Password must include at least one number")
    .regex(/[@$!%*?&]/, "Password must include at least one special character"),
  confirmPassword: z.string().min(8),
});
