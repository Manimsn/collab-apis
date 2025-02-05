// 🛠 Third-party modules
import * as chai from "chai";
import supertest from "supertest";
import bcrypt from "bcrypt";

// 🚀 Core application modules
import app from "../../app.js"; // Import the app
import User from "../../models/User.js";

// 📌 Configurations & Utilities
import { setupTestDB, teardownTestDB } from "../utils/setupTestDB.js";

const { expect } = chai;

describe("POST /auth", () => {
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
  const createTestUser = async (overrides = {}) => {
    const passwordHash = await bcrypt.hash("Password123", 10);
    return User.create({
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      passwordHash,
      plan: "BASIC",
      ...overrides,
    });
  };

  // --- Positive Test Cases ---
  it("should successfully login with valid credentials", async () => {
    await createTestUser();

    const res = await supertest(app).post("/auth").send({
      email: "john.doe@example.com",
      password: "Password123",
    });

    expect(res.status).to.equal(200);
    expect(res.body.accessToken).to.be.a("string"); // Access token should be returned
    expect(res.headers["set-cookie"]).to.exist; // Refresh token should be in a cookie
  });

  it("should login successfully regardless of email case", async () => {
    await createTestUser();

    const res = await supertest(app).post("/auth").send({
      email: "JOHN.DOE@EXAMPLE.COM", // Email in different case
      password: "Password123",
    });

    expect(res.status).to.equal(200);
    expect(res.body.accessToken).to.be.a("string");
    expect(res.headers["set-cookie"]).to.exist;
  });

  it("should handle multiple concurrent logins", async () => {
    await createTestUser();

    const res1 = await supertest(app).post("/auth").send({
      email: "john.doe@example.com",
      password: "Password123",
    });

    const res2 = await supertest(app).post("/auth").send({
      email: "john.doe@example.com",
      password: "Password123",
    });

    expect(res1.status).to.equal(200);
    expect(res2.status).to.equal(200);
    expect(res1.body.accessToken).to.not.equal(res2.body.accessToken); // Different access tokens
  });

  // --- Negative Test Cases ---
  it("should return 400 if email or password is missing", async () => {
    const res = await supertest(app).post("/auth").send({
      email: "john.doe@example.com",
    });

    expect(res.status).to.equal(400);
    expect(res.body.errors).to.be.an("array");
  });

  it("should return 400 for invalid email format", async () => {
    const res = await supertest(app).post("/auth").send({
      email: "invalid-email", // Invalid email
      password: "Password123",
    });

    expect(res.status).to.equal(400);
    expect(res.body.errors).to.be.an("array");
    expect(res.body.errors[0].message).to.equal("Invalid email");
    expect(res.body.errors[0].path).to.include("email");
  });

  it("should return 400 for weak password", async () => {
    const res = await supertest(app).post("/auth").send({
      email: "john.doe@example.com",
      password: "weak", // Weak password
    });

    expect(res.status).to.equal(400);
    expect(res.body.errors).to.be.an("array");
    expect(res.body.errors[0].message).to.include(
      "String must contain at least 8 character(s)"
    );
    expect(res.body.errors[0].path).to.include("password");
  });

  it("should return 401 for invalid email", async () => {
    const res = await supertest(app).post("/auth").send({
      email: "nonexistent@example.com", // Email not in the database
      password: "Password123",
    });

    expect(res.status).to.equal(401);
    expect(res.body.message).to.equal(
      "Unauthorized: Invalid email or password."
    );
  });

  it("should return 401 for incorrect password", async () => {
    await createTestUser();

    const res = await supertest(app).post("/auth").send({
      email: "john.doe@example.com",
      password: "WrongPassword", // Incorrect password
    });

    expect(res.status).to.equal(401);
    expect(res.body.message).to.equal(
      "Unauthorized: Invalid email or password."
    );
  });

  // it("should return 401 for reused refresh token", async () => {
  //   const user = await createTestUser();
  //   const reusedToken = "fake-token";
  //   // const reusedToken = jwt.sign(
  //   //   { userId: user._id },
  //   //   process.env.REFRESH_TOKEN_SECRET,
  //   //   { expiresIn: "7d" }
  //   // );
  //   user.refreshTokens = [reusedToken];
  //   await user.save();

  //   const res = await supertest(app)
  //     .post("/auth")
  //     .set("Cookie", `jwt=${reusedToken}`)
  //     .send({
  //       email: "john.doe@example.com",
  //       password: "Password123",
  //     });

  //   expect(res.status).to.equal(401);
  //   expect(res.headers["set-cookie"]).to.not.exist; // Cookie should be cleared
  //   expect(res.body.message).to.equal("Refresh token reuse detected.");
  // });

  // --- Edge Cases ---
  it("should return 400 for empty request body", async () => {
    const res = await supertest(app).post("/auth").send({});

    expect(res.status).to.equal(400);
    expect(res.body.errors).to.be.an("array");
  });

  it("should ignore additional fields in request body", async () => {
    await createTestUser();

    const res = await supertest(app).post("/auth").send({
      email: "john.doe@example.com",
      password: "Password123",
      extraField: "ShouldBeIgnored",
    });

    expect(res.status).to.equal(200);
    expect(res.body.accessToken).to.be.a("string");
  });
});
