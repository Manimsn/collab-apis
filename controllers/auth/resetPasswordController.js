import bcrypt from "bcrypt";

import User from "../../models/User.js";
import { resetPasswordSchema } from "../../validations/authValidation.js";

export const handleResetPassword = async (req, res, next) => {
  try {
    const validation = resetPasswordSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({ errors: validation.error.errors });
    }

    const { email, newPassword, confirmPassword } = validation.data;

    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ message: "New password and confirmation do not match." });
    }

    const foundUser = await User.findOne({
      email: { $regex: `^${email}$`, $options: "i" },
    }).exec();

    if (!foundUser) {
      return res
        .status(404)
        .json({ message: "User not found with the provided email." });
    }

    // Invalidate all refresh tokens
    foundUser.refreshTokens = [];

    // Update password history and hash the new password
    const isReused = foundUser.passwordHistory.some((oldHash) =>
      bcrypt.compareSync(newPassword, oldHash)
    );

    if (isReused) {
      return res
        .status(400)
        .json({ message: "Cannot reuse a previous password." });
    }

    foundUser.passwordHistory.push(foundUser.passwordHash);

    if (foundUser.passwordHistory.length > 5) {
      foundUser.passwordHistory.shift(); // Keep last 5 passwords
    }

    foundUser.passwordHash = await bcrypt.hash(newPassword, 10);

    // Update updatedAt timestamp
    foundUser.updatedAt = new Date();

    // Save changes to the database
    await foundUser.save();

    res.status(200).json({ message: "Password reset successfully." });
  } catch (err) {
    next(err);
  }
};
