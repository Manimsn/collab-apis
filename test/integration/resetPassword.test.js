import * as chai from "chai";
import supertest from "supertest";
import bcrypt from "bcrypt";

import app from "../../app.js"; // Import the Express app
import User from "../../models/User.js";
import { setupTestDB, teardownTestDB } from "../utils/setupTestDB.js";

const { expect } = chai;

describe("POST /reset-password", () => {
  before(async () => {
    await setupTestDB(); // Setup in-memory MongoDB
  });

  after(async () => {
    await teardownTestDB(); // Teardown in-memory MongoDB
  });

  beforeEach(async () => {
    await User.deleteMany({}); // Clear the User collection before each test
  });

  // Helper function to create a test user
  const createTestUser = async (overrides = {}) => {
    const passwordHash = await bcrypt.hash("OldPassword@123", 10);

    const user = await User.create({
      firstName: "John",
      lastName: "Doe",
      email: "johndoe@example.com",
      passwordHash,
      refreshTokens: ["validRefreshToken123"],
      plan: "FREE",
      passwordHistory: [], // To store old passwords
      ...overrides,
    });

    return user;
  };

  // --- Positive Test Cases ---
  it("should successfully reset password with valid data", async () => {
    const user = await createTestUser();

    const res = await supertest(app).post("/resetpassword").send({
      email: user.email,
      newPassword: "NewPass@123",
      confirmPassword: "NewPass@123",
    });

    expect(res.status).to.equal(200);
    expect(res.body.message).to.equal("Password reset successfully.");

    // Verify the password is updated in the database
    const updatedUser = await User.findOne({ email: user.email });
    const isPasswordUpdated = await bcrypt.compare(
      "NewPass@123",
      updatedUser.passwordHash
    );
    expect(isPasswordUpdated).to.be.true;

    // Ensure refresh tokens are invalidated
    expect(updatedUser.refreshTokens).to.be.empty;
  });

  // --- Negative Test Cases ---
  it("should return 400 when required fields are missing", async () => {
    const res = await supertest(app).post("/resetpassword").send({
      email: "johndoe@example.com",
    });

    expect(res.status).to.equal(400);
    expect(res.body).to.have.property("errors");
  });

  it("should return 404 when email is not found", async () => {
    const res = await supertest(app).post("/resetpassword").send({
      email: "nonexistent@example.com",
      newPassword: "NewPass@123",
      confirmPassword: "NewPass@123",
    });

    expect(res.status).to.equal(404);
    expect(res.body.message).to.equal(
      "User not found with the provided email."
    );
  });

  it("should return 400 when passwords do not match", async () => {
    const user = await createTestUser();

    const res = await supertest(app).post("/resetpassword").send({
      email: user.email,
      newPassword: "NewPass@123",
      confirmPassword: "DifferentPass@456",
    });

    expect(res.status).to.equal(400);
    expect(res.body.message).to.equal(
      "New password and confirmation do not match."
    );
  });

  it("should return 400 when password is too weak", async () => {
    const user = await createTestUser();

    const res = await supertest(app).post("/resetpassword").send({
      email: user.email,
      newPassword: "weak",
      confirmPassword: "weak",
    });
    // console.log(res.status);
    // console.log(res.body);

    expect(res.status).to.equal(400);
    expect(res.body.errors[0].message).to.include(
      "String must contain at least 8 character(s)"
    );
  });

  it("should return 400 when password does not meet security criteria", async () => {
    const user = await createTestUser();

    const res = await supertest(app).post("/resetpassword").send({
      email: user.email,
      newPassword: "newpassword", // Missing uppercase, number, special character
      confirmPassword: "newpassword",
    });

    expect(res.status).to.equal(400);
    expect(res.body.errors[0].message).to.include(
      "Password must include at least one uppercase letter"
    );
  });

  it("should return 400 when attempting to reuse an old password", async () => {
    const user = await createTestUser({
      passwordHistory: [await bcrypt.hash("NewPass@123", 10)], // Store old password
    });

    const res = await supertest(app).post("/resetpassword").send({
      email: user.email,
      newPassword: "NewPass@123",
      confirmPassword: "NewPass@123",
    });

    expect(res.status).to.equal(400);
    expect(res.body.message).to.equal("Cannot reuse a previous password.");
  });

  // --- Edge Cases ---
  it("should ignore extra fields in the request and still process correctly", async () => {
    const user = await createTestUser();

    const res = await supertest(app).post("/resetpassword").send({
      email: user.email,
      newPassword: "AnotherPass@123",
      confirmPassword: "AnotherPass@123",
      extraField: "should be ignored",
    });

    expect(res.status).to.equal(200);
    expect(res.body.message).to.equal("Password reset successfully.");
  });

  it("should return 400 when request body is empty", async () => {
    const res = await supertest(app).post("/resetpassword").send({});

    expect(res.status).to.equal(400);
    expect(res.body).to.have.property("errors");
  });

  it("should update the updatedAt timestamp", async () => {
    const user = await createTestUser();
    const previousUpdatedAt = user.updatedAt;

    await supertest(app).post("/resetpassword").send({
      email: user.email,
      newPassword: "FinalPass@123",
      confirmPassword: "FinalPass@123",
    });

    const updatedUser = await User.findOne({ email: user.email });
    expect(updatedUser.updatedAt).to.not.deep.equal(previousUpdatedAt);
  });
});
