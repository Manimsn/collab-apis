import jwt from "jsonwebtoken";

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
