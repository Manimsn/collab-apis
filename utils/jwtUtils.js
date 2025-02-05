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
