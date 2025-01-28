import * as chai from "chai";
import supertest from "supertest";
import app from "../../app.js"; // Import the app
import User from "../../models/User.js";
import { setupTestDB, teardownTestDB } from "../utils/setupTestDB.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const { expect } = chai;

describe("GET /refresh", () => {
  before(async () => {
    await setupTestDB(); // Setup in-memory MongoDB
  });

  after(async () => {
    await teardownTestDB(); // Teardown in-memory MongoDB
  });

  beforeEach(async () => {
    await User.deleteMany({}); // Clear the User collection before each test
  });

  // Helper to create a test user
  // Helper to create a test user
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

    return user; // Return the user object with the valid refresh token
  };

  // --- Positive Test Cases ---
  it("should successfully return a new access token when a valid refresh token is provided", async () => {
    const user = await createTestUser();
    // console.log("Test 1:", user);
    const validRefreshToken = user.refreshTokens[0];
    // console.log("Test Refresh Token: ", validRefreshToken);

    const res = await supertest(app)
      .get("/refresh")
      .set("Cookie", `jwt=${validRefreshToken}`);

    expect(res.status).to.equal(200);
    expect(res.body.accessToken).to.be.a("string"); // Access token should be returned
    expect(res.headers["set-cookie"]).to.exist; // New refresh token should be set in cookie
  });

  // --- Negative Test Cases ---
  it("should return 401 when no refresh token is provided", async () => {
    const res = await supertest(app).get("/refresh");

    expect(res.status).to.equal(401);
    expect(res.body.message).to.equal("Unauthorized: No token provided.");
  });

  it("should return 403 when an invalid refresh token is provided", async () => {
    await createTestUser();
    const invalidRefreshToken = "invalid.token";

    const res = await supertest(app)
      .get("/refresh")
      .set("Cookie", `jwt=${invalidRefreshToken}`);

    expect(res.status).to.equal(403);
  });

  it("should return 403 when a valid refresh token is reused after being invalidated", async () => {
    const user = await createTestUser();
    const reusedToken = user.refreshTokens[0];

    // Simulate invalidating the refresh token by removing it from the user's tokens
    user.refreshTokens = [];
    await user.save();

    const res = await supertest(app)
      .get("/refresh")
      .set("Cookie", `jwt=${reusedToken}`);

    expect(res.status).to.equal(403);
    expect(res.body).to.be.empty; // Response body should be empty
  });//

  it("should clear all tokens for a user if a reused token is detected", async () => {
    const user = await createTestUser();
    const reusedToken = user.refreshTokens[0];

    // Simulate token reuse
    user.refreshTokens = [];
    await user.save();

    const res = await supertest(app)
      .get("/refresh")
      .set("Cookie", `jwt=${reusedToken}`);

    expect(res.status).to.equal(403);
    const updatedUser = await User.findById(user._id).exec();
    expect(updatedUser.refreshTokens).to.be.empty; // All tokens should be cleared
  });//

  // --- Edge Cases ---
  it("should return 403 for an expired refresh token", async () => {
    // Create a test user without any refresh tokens initially
    const user = await createTestUser();

    // Generate an expired refresh token using the user's actual _id
    const expiredToken = jwt.sign(
      { userId: user._id.toString() }, // Use the user's dynamic _id
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1ms" } // Expired immediately
    );

    // Add the expired token to the user's refreshTokens array and save
    user.refreshTokens.push(expiredToken);
    await user.save();

    // Simulate the /refresh route with the expired token
    const res = await supertest(app)
      .get("/refresh")
      .set("Cookie", `jwt=${expiredToken}`);

    // Assertions
    expect(res.status).to.equal(403); // Forbidden due to expired token
    expect(res.body.message).to.equal("Forbidden: Token expired."); // Ensure correct error message
  });

  it("should return 403 if refresh token's userId does not match the database user", async () => {
    const user = await createTestUser();

    const otherUserToken = jwt.sign(
      { userId: new mongoose.Types.ObjectId().toString() }, // Mismatched userId
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1d" }
    );

    const res = await supertest(app)
      .get("/refresh")
      .set("Cookie", `jwt=${otherUserToken}`);

    expect(res.status).to.equal(403); // Forbidden due to userId mismatch
    // expect(res.body.message).to.equal("Forbidden: Invalid token."); // Ensure correct error message
    expect(res.body).to.be.empty;
  });

  it("should return 200 and issue a new access token when there are multiple valid refresh tokens", async () => {
    // Create a test user
    const user = await createTestUser();

    // Add multiple valid refresh tokens for this specific test
    const refreshTokens = [
      jwt.sign(
        { userId: user._id.toString() },
        process.env.REFRESH_TOKEN_SECRET,
        {
          expiresIn: "1d",
        }
      ),
      jwt.sign(
        { userId: user._id.toString() },
        process.env.REFRESH_TOKEN_SECRET,
        {
          expiresIn: "1d",
        }
      ),
    ];

    user.refreshTokens = refreshTokens;
    await user.save();

    // Use the second valid refresh token
    const validRefreshToken = user.refreshTokens[1];

    // Call the refresh endpoint
    const res = await supertest(app)
      .get("/refresh")
      .set("Cookie", `jwt=${validRefreshToken}`);

    // Assertions
    expect(res.status).to.equal(200);
    expect(res.body.accessToken).to.be.a("string");
    expect(res.headers["set-cookie"]).to.exist; // Ensure a new refresh token is set
  });
});
