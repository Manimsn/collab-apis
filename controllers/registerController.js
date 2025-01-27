import bcrypt from "bcrypt";
import { z } from "zod";
import UserService from "../services/userService.js"; // Use ESM import

export const handleNewUser = async (req, res, next) => {
  try {
    // Validate input
    const userSchema = z.object({
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      email: z.string().email(),
      password: z.string().min(8),
      plan: z.enum(["FREE", "BASIC", "PREMIUM"]),
      planType: z.union([z.enum(["Monthly", "Yearly"]), z.null()]).optional(), // Allow null or valid enum
      designation: z.string().optional(),
      location: z.string().optional(),
    });

    const validation = userSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ errors: validation.error.errors });
    }

    const {
      firstName,
      lastName,
      email,
      password,
      plan,
      planType,
      designation,
      location,
    } = validation.data;

    // Check for duplicate email
    const existingUser = await UserService.isEmailDuplicate(email);
    if (existingUser) {
      return res.status(409).json({ message: "Email already exists." });
    }

    // Create user
    const user = await UserService.createUser({
      firstName,
      lastName,
      email,
      password,
      plan,
      planType,
      designation,
      location,
    });

    res.status(201).json({
      message: `User ${user.firstName} ${user.lastName} created successfully.`,
    });
  } catch (err) {
    next(err); // Pass error to global handler
  }
};
