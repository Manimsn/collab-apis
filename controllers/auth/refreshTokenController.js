import { findUser } from "../../services/userService.js";
import {
  clearJwtCookie,
  verifyAndHandleHackedUser,
  verifyAndHandleRefreshToken,
} from "../../utils/jwtUtils.js";

// Steps to reproduce: Reusing the valid token
// 	1. set the refresh token expiry to 1d not 10 seconds because if token expired it will be behave as invalid signature instead of hacked user detection
// 	2. Login in browser with react UI and go to admin page
// 	3. copy the token ->	grab the jwt token (refresh token) from inpect->application->cookies->jwt (which will not be accessible by javascript)
// 	4. now again go to home and come to admin page and see the jwt will be refresh and new one will be there so exisitn becomes invalid
// 	5. now take the old token from step 3 and use the same in the post man create cookie and paste as jwt=copiedtoken;
// 	6. now hit the refresh route -> http://localhost:3500/refresh you can see 401 unauthorized

export const handleRefreshToken = async (req, res, next) => {
  try {
    const cookies = req.cookies;

    // Check if refresh token exists in cookies
    if (!cookies?.jwt) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided." });
    }

    const refreshToken = cookies.jwt;

    // Clear the old refresh token cookie
    clearJwtCookie(res);

    // Find user associated with the refresh token
    const foundUser = await findUser({ refreshTokens: refreshToken });

    // Handle refresh token reuse or invalid token
    if (!foundUser) {
      await verifyAndHandleHackedUser(refreshToken, res);

      return; // Prevent further execution
    }

    // Remove the used refresh token from the user's array
    const newRefreshTokenArray = foundUser.refreshTokens.filter(
      (rt) => rt !== refreshToken
    );

    // Verify the incoming refresh token
    await verifyAndHandleRefreshToken(
      refreshToken,
      res,
      foundUser,
      newRefreshTokenArray
    );
  } catch (err) {
    next(err); // Pass error to the global error handler
  }
};
