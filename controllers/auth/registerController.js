import UserService from "../../services/userService.js"; // Use ESM import
import { userSchema } from "../../validations/authValidation.js";

export const handleNewUser = async (req, res, next) => {
  try {
    // Validate input
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
