import User from "../models/User.js";
import { clearJwtCookie } from "../utils/jwtUtils.js";

export const handleLogout = async (req, res, next) => {
  try {
    const cookies = req.cookies;

    // Check if the JWT cookie exists
    if (!cookies?.jwt) return res.sendStatus(204); // No content

    const refreshToken = cookies.jwt;

    // Check if the refreshToken exists in the database
    const foundUser = await User.findOne({
      refreshTokens: refreshToken,
    }).exec();

    if (!foundUser) {
      // Token doesn't exist in DB. Clear the cookie and send 204 response.
      clearJwtCookie(res);
      return res.sendStatus(204); // No content
    }

    // Filter out the used refresh token from the user's tokens array
    foundUser.refreshTokens = foundUser.refreshTokens.filter(
      (rt) => rt !== refreshToken
    );

    // Save the updated user in the database
    await foundUser.save();

    // Clear the refreshToken cookie
    clearJwtCookie(res);
    res.sendStatus(204); // No content
  } catch (err) {
    next(err); // Pass errors to the global error handler
  }
};
