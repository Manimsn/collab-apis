import * as chai from "chai";
import supertest from "supertest";
import app from "../../app.js"; // Import the app
import Project from "../../models/Project.js";
import { setupTestDB, teardownTestDB } from "../utils/setupTestDB.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const { expect } = chai;

describe("POST /projects", () => {
  let authToken;
  let userId;

  before(async () => {
    await setupTestDB(); // Setup in-memory MongoDB
  });

  after(async () => {
    await teardownTestDB(); // Teardown in-memory MongoDB
  });

  beforeEach(async () => {
    await Project.deleteMany({}); // Clear the Project collection before each test

    // Create a mock user ID
    userId = new mongoose.Types.ObjectId();

    // Generate a valid access token
    authToken = jwt.sign(
      { UserInfo: { userId: userId.toString() } }, // ✅ Matches middleware structure
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" }
    );
  });

  // --- Positive Test Cases ---
  it("should successfully create a new project", async () => {
    const res = await supertest(app)
      .post("/projects")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "Project Alpha",
        description: "Test project",
        location: "New York",
      });

    expect(res.status).to.equal(201);
    expect(res.body.message).to.equal("Project created successfully");
    expect(res.body.projectId).to.be.a("string");
  });

  // --- Negative Test Cases ---
  it("should return 400 if project name is missing", async () => {
    const res = await supertest(app)
      .post("/projects")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        description: "Test project",
        location: "New York",
      });

    expect(res.status).to.equal(400);
    expect(res.body.message).to.equal("Validation failed");
    expect(res.body.errors.name._errors[0]).to.equal(
      "Project name must be at least 3 characters long"
    );
  });

  it("should return 400 if project location is missing", async () => {
    const res = await supertest(app)
      .post("/projects")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "Project Alpha",
        description: "Test project",
      });

    expect(res.status).to.equal(400);
    expect(res.body.message).to.equal("Validation failed");
    expect(res.body.errors.location._errors[0]).to.equal(
      "Location must be at least 3 characters long"
    );
  });

  it("should return 400 if project name is too short", async () => {
    const res = await supertest(app)
      .post("/projects")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "AB",
        description: "Test project",
        location: "New York",
      });

    expect(res.status).to.equal(400);
    expect(res.body.message).to.equal("Validation failed");
    expect(res.body.errors.name._errors[0]).to.equal(
      "Project name must be at least 3 characters long"
    );
  });

  it("should return 400 if project location is too short", async () => {
    const res = await supertest(app)
      .post("/projects")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "Project Alpha",
        description: "Test project",
        location: "NY",
      });

    expect(res.status).to.equal(400);
    expect(res.body.message).to.equal("Validation failed");
    expect(res.body.errors.location._errors[0]).to.equal(
      "Location must be at least 3 characters long"
    );
  });

  it("should return 400 if project name already exists", async () => {
    // Create a project first
    await Project.create({
      name: "Project Alpha",
      description: "Existing project",
      location: "New York",
      createdBy: userId,
    });

    // Attempt to create a project with the same name
    const res = await supertest(app)
      .post("/projects")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "Project Alpha",
        description: "Duplicate project",
        location: "Los Angeles",
      });

    expect(res.status).to.equal(400);
    expect(res.body.message).to.equal(
      "Project name already exists. Please choose a different name."
    );
  });

  it("should return 401 when no access token is provided", async () => {
    const res = await supertest(app).post("/projects").send({
      name: "Unauthorized Project",
      description: "Test project",
      location: "New York",
    });

    expect(res.status).to.equal(401);
    expect(res.body.message).to.equal("Access token missing or invalid");
  });

  it("should return 403 when an invalid access token is provided", async () => {
    const res = await supertest(app)
      .post("/projects")
      .set("Authorization", "Bearer invalid.token.here")
      .send({
        name: "Project Alpha",
        description: "Test project",
        location: "New York",
      });

    expect(res.status).to.equal(403);
    expect(res.body.message).to.equal("Invalid or expired token");
  });

  it("should return 403 when using an expired access token", async () => {
    const expiredToken = jwt.sign(
      { userId: userId.toString() },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1ms" } // Expired immediately
    );

    const res = await supertest(app)
      .post("/projects")
      .set("Authorization", `Bearer ${expiredToken}`)
      .send({
        name: "Expired Project",
        description: "Test project",
        location: "New York",
      });

    expect(res.status).to.equal(403);
    expect(res.body.message).to.equal("Invalid or expired token");
  });
});
