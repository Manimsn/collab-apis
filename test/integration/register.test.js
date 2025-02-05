// 🛠 Third-party modules
import * as chai from "chai";
import supertest from "supertest";

// 🚀 Core application modules
import app from "../../app.js"; // Import the app
import User from "../../models/User.js"; // Import the User model

// 📌 Configurations & Utilities
import { setupTestDB, teardownTestDB } from "../utils/setupTestDB.js";
import { findUser } from "../../services/userService.js";

const { expect } = chai;

describe("POST /register", () => {
  before(async () => {
    await setupTestDB(); // Start in-memory MongoDB
  });

  after(async () => {
    await teardownTestDB(); // Stop in-memory MongoDB
  });

  beforeEach(async () => {
    await User.deleteMany({}); // Clear the User collection before each test
  });

  // --- Positive Test Case ---
  it("should successfully register a user with valid data", async () => {
    const res = await supertest(app).post("/register").send({
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      password: "Password123",
      plan: "BASIC",
      planType: "Monthly",
    });

    expect(res.status).to.equal(201);
    expect(res.body.message).to.equal("User John Doe created successfully.");

    // Verify the user exists in the database
    const user = await findUser({ email: "john.doe@example.com" });
    expect(user).to.not.be.null;
    expect(user.passwordHash).to.not.equal("Password123"); // Ensure password is hashed
    expect(user.planType).to.equal("Monthly");
  });

  // --- Validation Errors ---
  it("should return 400 if required fields are missing", async () => {
    const res = await supertest(app).post("/register").send({
      email: "missing.fields@example.com",
      password: "Password123",
    });

    expect(res.status).to.equal(400);
    expect(res.body.errors).to.be.an("array");
  });

  it("should return 400 for invalid email format", async () => {
    const res = await supertest(app).post("/register").send({
      firstName: "John",
      lastName: "Doe",
      email: "invalid-email",
      password: "Password123",
      plan: "BASIC",
    });

    expect(res.status).to.equal(400);
    expect(res.body.errors).to.be.an("array");
    expect(res.body.errors[0].message).to.equal("Invalid email"); // Match the exact message
    expect(res.body.errors[0].path).to.include("email"); // Ensure the path points to the email field
  });

  it("should return 400 for weak password", async () => {
    const res = await supertest(app).post("/register").send({
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      password: "weak",
      plan: "BASIC",
    });

    // Assert the errors array exists and contains the right structure
    expect(res.body.errors).to.be.an("array");
    expect(res.body.errors[0]).to.have.property(
      "message",
      "String must contain at least 8 character(s)"
    );
    expect(res.body.errors[0]).to.have.property("code", "too_small"); // Ensure the validation code is correct
    expect(res.body.errors[0].path).to.include("password"); // Ensure the error points to the password field
  });

  it("should return 400 for invalid plan", async () => {
    const res = await supertest(app).post("/register").send({
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      password: "Password123",
      plan: "INVALID_PLAN",
    });

    expect(res.status).to.equal(400);
    expect(res.body.errors).to.be.an("array");
    expect(res.body.errors[0].message).to.include("Invalid enum value");
  });

  // --- Duplicate Email ---
  it("should return 409 if email already exists", async () => {
    await User.create({
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      passwordHash: "hashed-password",
      plan: "BASIC",
    });

    const res = await supertest(app).post("/register").send({
      firstName: "Jane",
      lastName: "Smith",
      email: "john.doe@example.com", // Duplicate email
      password: "Password123",
      plan: "FREE",
    });

    expect(res.status).to.equal(409);
    expect(res.body.message).to.equal("Email already exists.");
  });

  // --- Empty Request Body ---
  it("should return 400 if the request body is empty", async () => {
    const res = await supertest(app).post("/register").send({});

    expect(res.status).to.equal(400);
    expect(res.body.errors).to.be.an("array");
  });

  // --- Database Verification ---
  it("should store default values in the database", async () => {
    const res = await supertest(app).post("/register").send({
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      password: "Password123",
      plan: "BASIC",
    });

    expect(res.status).to.equal(201);

    const user = await findUser({ email: "john.doe@example.com" });
    expect(user.planType).to.be.null; // Default value for planType
    expect(user.credits).to.equal(0); // Default value for credits
  });

  // --- Security ---
  it("should not expose sensitive data in the response", async () => {
    const res = await supertest(app).post("/register").send({
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      password: "Password123",
      plan: "BASIC",
    });

    expect(res.status).to.equal(201);
    expect(res.body).to.not.have.property("passwordHash");
    expect(res.body).to.not.have.property("refreshTokens");
  });
});
