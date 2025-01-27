import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Steps to reproduce:
// 	1. set the refresh token expiry to 10 seconds
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
    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "None",
      secure: true,
    });

    // Find user associated with the refresh token
    const foundUser = await User.findOne({
      refreshTokens: refreshToken,
    }).exec();

    // Handle refresh token reuse or invalid token
    if (!foundUser) {
      jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        async (err, decoded) => {
          if (err) return res.sendStatus(403); // Forbidden

          console.log("Detected refresh token reuse.");
          const hackedUser = await User.findOne({ _id: decoded.userId }).exec();
          if (hackedUser) {
            hackedUser.refreshTokens = [];
            const result = await hackedUser.save();
            console.log(result);
          }
        }
      );
      return res.sendStatus(403); // Forbidden
    }

    // Remove the used refresh token from the user's array
    const newRefreshTokenArray = foundUser.refreshTokens.filter(
      (rt) => rt !== refreshToken
    );

    // Verify the incoming refresh token
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      async (err, decoded) => {
        if (err) {
          console.log("Expired refresh token.");
          foundUser.refreshTokens = [...newRefreshTokenArray]; // Remove the expired token
          const result = await foundUser.save();
          console.log(result);
          return res.status(403).json({ message: "Forbidden: Token expired." });
        }
        console.log("Expired refresh token.");
        // Validate the decoded user ID
        if (decoded.userId !== String(foundUser._id)) {
          return res.status(403).json({ message: "Forbidden: Invalid token." });
        }

        // Generate new access token
        // const roles = Object.values(foundUser.roles || {});
        const accessToken = jwt.sign(
          {
            UserInfo: {
              userId: foundUser._id,
              //   roles,
            },
          },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "10s" }
        );

        // Generate a new refresh token
        const newRefreshToken = jwt.sign(
          { userId: foundUser._id },
          process.env.REFRESH_TOKEN_SECRET,
          { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "10s" }
        );

        // Update refresh token array
        foundUser.refreshTokens = [...newRefreshTokenArray, newRefreshToken];
        await foundUser.save();

        // Send the new refresh token in a secure cookie
        res.cookie("jwt", newRefreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: "None",
          maxAge: 24 * 60 * 60 * 1000, // 1 day
        });

        // Send the new access token in the response
        res.status(200).json({ accessToken });
      }
    );
  } catch (err) {
    next(err); // Pass error to the global error handler
  }
};
