import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { z } from "zod";

// Validation schema for login request
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const handleLogin = async (req, res, next) => {
  try {
    const cookies = req.cookies;
    const validation = loginSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({ errors: validation.error.errors });
    }

    const { email, password } = validation.data;

    // Find user by email
    const foundUser = await User.findOne({
      email: { $regex: `^${email}$`, $options: "i" },
    }).exec();
    if (!foundUser) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Invalid email or password." });
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(
      password,
      foundUser.passwordHash
    );
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Invalid email or password." });
    }

    // Generate roles array (e.g., Admin, User, etc.)
    // const roles = Object.values(foundUser.roles || {}).filter(Boolean);

    // Generate access and refresh tokens
    const accessToken = jwt.sign(
      {
        UserInfo: {
          userId: foundUser._id,
          email: foundUser.email,
          session: Date.now(),
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "10s" }
    );

    const newRefreshToken = jwt.sign(
      { userId: foundUser._id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "10s" }
    );

    // Manage refresh tokens array
    let newRefreshTokenArray = cookies?.jwt
      ? foundUser.refreshTokens.filter((rt) => rt !== cookies.jwt)
      : foundUser.refreshTokens;

    if (cookies?.jwt) {
      const foundToken = await User.findOne({
        refreshTokens: cookies.jwt,
      }).exec();
      if (!foundToken) {
        console.log("Detected refresh token reuse!");
        newRefreshTokenArray = [];
      }
      res.clearCookie("jwt", {
        httpOnly: true,
        sameSite: "None",
        secure: true,
      });
    }

    // Save updated refresh tokens in DB
    foundUser.refreshTokens = [...newRefreshTokenArray, newRefreshToken];
    await foundUser.save();

    // Set secure refresh token cookie
    res.cookie("jwt", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    // Send access token and success response
    res.status(200).json({ accessToken });
  } catch (err) {
    next(err); // Pass errors to global error handler
  }
};
