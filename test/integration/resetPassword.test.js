import * as chai from "chai";
import supertest from "supertest";
import bcrypt from "bcrypt";

import app from "../../app.js"; // Import your Express app
import User from "../../models/User.js";
import { setupTestDB, teardownTestDB } from "../utils/setupTestDB.js";

const { expect } = chai;

describe("POST /resetpassword", () => {
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

  // --- Positive Test Case ---
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

  // --- Negative Test Cases for Password Validation ---
  it("should return all validation errors if password does not meet security criteria", async () => {
    const user = await createTestUser();

    const res = await supertest(app).post("/resetpassword").send({
      email: user.email,
      newPassword: "weak", // Weak password (no uppercase, number, or special character)
      confirmPassword: "weak",
    });

    expect(res.status).to.equal(400);
    expect(res.body.errors).to.be.an("array").that.has.lengthOf(5);

    const messages = res.body.errors.map((error) => error.message);
    expect(messages).to.include("String must contain at least 8 character(s)");
    expect(messages).to.include(
      "Password must include at least one uppercase letter"
    );
    expect(messages).to.include("Password must include at least one number");
    expect(messages).to.include(
      "Password must include at least one special character"
    );
  });

  it("should return an error if password is too short", async () => {
    const user = await createTestUser();

    const res = await supertest(app).post("/resetpassword").send({
      email: user.email,
      newPassword: "A@1", // Too short
      confirmPassword: "A@1",
    });

    expect(res.status).to.equal(400);
    expect(res.body.errors[0].message).to.include(
      "String must contain at least 8 character(s)"
    );
  });

  it("should return an error if password does not contain an uppercase letter", async () => {
    const user = await createTestUser();

    const res = await supertest(app).post("/resetpassword").send({
      email: user.email,
      newPassword: "newpassword1@", // No uppercase letter
      confirmPassword: "newpassword1@",
    });

    expect(res.status).to.equal(400);
    expect(res.body.errors[0].message).to.include(
      "Password must include at least one uppercase letter"
    );
  });

  it("should return an error if password does not contain a number", async () => {
    const user = await createTestUser();

    const res = await supertest(app).post("/resetpassword").send({
      email: user.email,
      newPassword: "NewPassword@", // No number
      confirmPassword: "NewPassword@",
    });

    expect(res.status).to.equal(400);
    expect(res.body.errors[0].message).to.include(
      "Password must include at least one number"
    );
  });

  it("should return an error if password does not contain a special character", async () => {
    const user = await createTestUser();

    const res = await supertest(app).post("/resetpassword").send({
      email: user.email,
      newPassword: "NewPassword1", // No special character
      confirmPassword: "NewPassword1",
    });

    expect(res.status).to.equal(400);
    expect(res.body.errors[0].message).to.include(
      "Password must include at least one special character"
    );
  });

  // --- Other Negative Cases ---
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
