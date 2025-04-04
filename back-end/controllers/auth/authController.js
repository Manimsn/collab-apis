import bcrypt from "bcrypt";

import {
  clearJwtCookie,
  generateAccessToken,
  generateRefreshToken,
  setJwtCookie,
} from "../../utils/jwtUtils.js";
import { loginSchema } from "../../validations/authValidation.js";
import { findUser } from "../../services/userService.js";

export const handleLogin = async (req, res, next) => {
  try {
    const cookies = req.cookies;
    const validation = loginSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({ errors: validation.error.errors });
    }

    const { email, password } = validation.data;

    // Find user by email
    const foundUser = await findUser({
      email: { $regex: `^${email}$`, $options: "i" },
    });

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

    // Generate access and refresh tokens
    const accessToken = generateAccessToken(foundUser);
    const newRefreshToken = generateRefreshToken(foundUser);

    // Manage refresh tokens array
    let newRefreshTokenArray = cookies?.jwt
      ? foundUser.refreshTokens.filter((rt) => rt !== cookies.jwt)
      : foundUser.refreshTokens;

    if (cookies?.jwt) {
      const foundToken = await findUser({ refreshTokens: cookies.jwt });

      if (!foundToken) {
        console.log("Detected refresh token reuse!");
        newRefreshTokenArray = [];
      }

      clearJwtCookie(res);
    }

    // Save updated refresh tokens in DB
    foundUser.refreshTokens = [...newRefreshTokenArray, newRefreshToken];
    await foundUser.save();

    // Set secure refresh token cookie
    setJwtCookie(res, newRefreshToken);

    // Send access token and success response
    res.status(200).json({ accessToken });
  } catch (err) {
    next(err); // Pass errors to global error handler
  }
};
