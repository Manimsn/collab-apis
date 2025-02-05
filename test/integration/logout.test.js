// 🛠 Third-party modules
import * as chai from "chai";
import supertest from "supertest";
import jwt from "jsonwebtoken";

// 🚀 Core application modules
import app from "../../app.js"; // Import the app
import User from "../../models/User.js";

// 📌 Configurations & Utilities
import { setupTestDB, teardownTestDB } from "../utils/setupTestDB.js";

const { expect } = chai;

describe("GET /logout", () => {
  before(async () => {
    await setupTestDB(); // Setup in-memory MongoDB
  });

  after(async () => {
    await teardownTestDB(); // Teardown in-memory MongoDB
  });

  beforeEach(async () => {
    await User.deleteMany({}); // Clear the User collection before each test
  });

  // Helper to create a user with a refresh token
  const createTestUser = async (overrides = {}) => {
    // Create user in the database without refresh token first
    const user = await User.create({
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      passwordHash: "dummyhash",
      refreshTokens: [],
      plan: "FREE",
      ...overrides,
    });

    // Generate a refresh token using the user's actual _id
    const refreshToken = jwt.sign(
      { userId: user._id.toString() }, // Use MongoDB _id as userId
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1d" }
    );

    // Add the refresh token to the user record
    user.refreshTokens.push(refreshToken);
    await user.save();

    return { user, refreshToken }; // Return the user object with the valid refresh token
  };

  // --- Positive Test Case ---
  // Why this test is important:
  //    This test verifies the happy path for the logout API. It ensures that:
  //        The refresh token is properly removed from the database.
  //        The user's session is invalidated.
  //        The jwt cookie is cleared securely.
  it("should successfully logout and clear the refresh token", async () => {
    const { user, refreshToken } = await createTestUser();

    const res = await supertest(app)
      .get("/logout")
      .set("Cookie", `jwt=${refreshToken}`);

    expect(res.status).to.equal(204); // No content
    expect(res.headers["set-cookie"]).to.exist; // Cookie cleared

    // Verify the refresh token is removed from the database
    const updatedUser = await User.findById(user._id);
    expect(updatedUser.refreshTokens).to.not.include(refreshToken);
  });

  // --- No Refresh Token Cookie ---
  //   Why this test is important:
  // Handles Missing Cookies Gracefully:

  //    This test ensures that the logout API doesn't break or throw errors when no jwt cookie is provided.
  //    A logout request without a cookie might happen in real-world scenarios, for example:
  //        A user is already logged out and makes a redundant logout request.
  //        The client loses the jwt cookie for some reason but still tries to log out.
  //    Ensures Idempotence:
  //        The logout API is idempotent, meaning calling it multiple times (even without a token) should have the same effect: return 204 and clear cookies if necessary.
  it("should return 204 if no refresh token cookie is provided", async () => {
    const res = await supertest(app).get("/logout");

    expect(res.status).to.equal(204); // No content
    expect(res.headers["set-cookie"]).to.not.exist; // No cookies set
  });

  // --- Invalid Refresh Token ---
  //   Why this test is important:
  //      Prevents Reuse of Invalid Tokens:
  //          An invalid or fake refresh token should not remain in the client's cookies. By clearing the cookie, the API ensures that the invalid token cannot be reused.
  //      Graceful Handling of Invalid Tokens:
  //          This test ensures the API does not throw errors or behave unexpectedly when receiving an invalid token. Instead, it simply clears the cookie and responds with 204 No Content.
  //      Ensures Cookies Are Cleared:
  //          Even if the refresh token is invalid (not in the database), the jwt cookie is cleared from the client's browser to avoid confusion.
  it("should return 204 and clear the cookie if the refresh token is not in the database", async () => {
    const res = await supertest(app)
      .get("/logout")
      .set("Cookie", "jwt=invalid-refresh-token");

    expect(res.status).to.equal(204); // No content
    expect(res.headers["set-cookie"]).to.exist; // Cookie cleared
  });

  // --- Idempotence ---
  it("should return 204 if the token has already been removed", async () => {
    const { user, refreshToken } = await createTestUser();

    // First logout request (removes the token)
    await supertest(app).get("/logout").set("Cookie", `jwt=${refreshToken}`);

    // Second logout request (token is already removed)
    const res = await supertest(app)
      .get("/logout")
      .set("Cookie", `jwt=${refreshToken}`);

    expect(res.status).to.equal(204); // No content
    expect(res.headers["set-cookie"]).to.exist; // Cookie cleared

    // Verify the token array is still empty
    const updatedUser = await User.findById(user._id);
    expect(updatedUser.refreshTokens).to.be.empty;
  });

  // --- Cookie Security ---
  it("should ensure the JWT cookie is httpOnly, secure, and sameSite=none when cleared", async () => {
    const { refreshToken } = await createTestUser();

    const res = await supertest(app)
      .get("/logout")
      .set("Cookie", `jwt=${refreshToken}`);

    expect(res.status).to.equal(204);
    expect(res.headers["set-cookie"]).to.exist;
    const cookie = res.headers["set-cookie"][0];
    expect(cookie).to.include("HttpOnly");
    expect(cookie).to.include("Secure");
    expect(cookie).to.include("SameSite=None");
  });

  // --- Edge Case: Empty User Refresh Token Array ---
  it("should return 204 if the user has an empty refresh token array", async () => {
    const user = await User.create({
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      passwordHash: "dummyhash",
      refreshTokens: [], // Empty token array
      plan: "FREE",
    });

    const res = await supertest(app)
      .get("/logout")
      .set("Cookie", "jwt=some-invalid-token");

    expect(res.status).to.equal(204); // No content
    expect(res.headers["set-cookie"]).to.exist; // Cookie cleared
  });
});
