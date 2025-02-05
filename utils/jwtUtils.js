import jwt from "jsonwebtoken";
import User from "../models/User.js"; // Adjust path based on your project structure

/**
 * Generates an access token for a user.
 * @param {Object} user - The user object containing user details.
 * @returns {string} - The signed JWT access token.
 */
export const generateAccessToken = (user, expiresIn) => {
  return jwt.sign(
    {
      UserInfo: {
        userId: user._id,
        email: user.email,
        plan: user.plan,
        session: Date.now(),
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: expiresIn || process.env.ACCESS_TOKEN_EXPIRY || "10s" }
  );
};

/**
 * Generates a refresh token for a user.
 * @param {Object} user - The user object containing user details.
 * @param {string} [expiresIn] - Optional expiration time for the refresh token.
 * @returns {string} - The signed JWT refresh token.
 */
export const generateRefreshToken = (user, expiresIn) => {
  return jwt.sign({ userId: user._id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: expiresIn || process.env.REFRESH_TOKEN_EXPIRY || "10s",
  });
};

/**
 * Clears the JWT cookie from the response.
 * @param {Response} res - The Express response object.
 */
export const clearJwtCookie = (res) => {
  res.clearCookie("jwt", {
    httpOnly: true,
    sameSite: "None",
    secure: true,
  });
};

/**
 * Sets a JWT cookie in the response.
 * @param {Response} res - The Express response object.
 * @param {string} token - The JWT token to be set.
 * @param {number} [maxAge] - Optional max age for the cookie (default: 24 hours).
 */
export const setJwtCookie = (res, token, maxAge = 24 * 60 * 60 * 1000) => {
  res.cookie("jwt", token, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge, // Default: 24 hours 24 * 60 * 60 * 1000, // 1 day
  });
};


/**
 * Verifies a refresh token and processes authentication logic.
 * @param {string} refreshToken - The refresh token to verify.
 * @param {Response} res - The Express response object.
 * @param {User} foundUser - The user object from the database.
 * @param {Array} newRefreshTokenArray - Updated refresh token array.
 * @returns {Promise<void>}
 */
export const verifyAndHandleRefreshToken = async (
  refreshToken,
  res,
  foundUser,
  newRefreshTokenArray
) => {
  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    async (err, decoded) => {
      if (err) {
        foundUser.refreshTokens = [...newRefreshTokenArray]; // Remove the expired token
        await foundUser.save();
        return res.status(403).json({ message: "Forbidden: Token expired." });
      }

      // Validate the decoded user ID
      if (decoded.userId !== foundUser._id.toString()) {
        return res.status(403).json({ message: "Forbidden: Invalid token." });
      }

      // Generate new tokens
      const accessToken = generateAccessToken(foundUser);
      const newRefreshToken = generateRefreshToken(foundUser);

      // Update refresh token array
      foundUser.refreshTokens = [...newRefreshTokenArray, newRefreshToken];
      await foundUser.save();

      // Send the new refresh token in a secure cookie
      setJwtCookie(res, newRefreshToken);

      // Send the new access token in the response
      res.status(200).json({ accessToken });
    }
  );
};

/**
 * Verifies a refresh token and handles hacked user detection.
 * @param {string} refreshToken - The refresh token to verify.
 * @param {Response} res - The Express response object.
 * @returns {Promise<void>}
 */
export const verifyAndHandleHackedUser = async (refreshToken, res) => {
  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    async (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Forbidden: Invalid token." });
      }

      const hackedUser = await User.findOne({ _id: decoded.userId }).exec();

      if (hackedUser) {
        hackedUser.refreshTokens = [];
        await hackedUser.save();
      }

      return res.sendStatus(403); // Forbidden
    }
  );
};
