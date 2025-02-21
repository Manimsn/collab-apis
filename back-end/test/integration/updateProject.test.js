// 🛠 Third-party modules
import * as chai from "chai";
import supertest from "supertest";
import mongoose from "mongoose";

// 🚀 Core application modules
import app from "../../app.js"; // Import the app
import Project from "../../models/Project.js";

// 📌 Configurations & Utilities
import { setupTestDB, teardownTestDB } from "../utils/setupTestDB.js";
import { generateAccessToken } from "../../utils/jwtUtils.js";

const { expect } = chai;

describe("PUT /projects/:projectId", () => {
  let authToken;
  let userId;
  let projectId;

  before(async () => {
    await setupTestDB(); // Setup in-memory MongoDB
  });

  after(async () => {
    await teardownTestDB(); // Teardown in-memory MongoDB
  });

  beforeEach(async () => {
    await Project.deleteMany({}); // Clear the Project collection before each test

    // Create a mock user
    userId = new mongoose.Types.ObjectId();

    // Generate a valid access token
    const foundUser = {
      _id: userId.toString(),
      email: "owner@example.com",
      plan: "BASIC",
    };
    authToken = generateAccessToken(foundUser);

    // Create a project
    const project = await Project.create({
      name: "Initial Project",
      description: "Original description",
      location: "New York",
      createdBy: userId.toString(),
      ownerEmail: "owner@example.com",
    });

    projectId = project._id.toString();
  });

  // --- ✅ Positive Test Cases ---
  it("should successfully update a project name", async () => {
    const res = await supertest(app)
      .put(`/projects/${projectId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ name: "Updated Project Name" });

    expect(res.status).to.equal(200);
    expect(res.body.message).to.equal("Project updated successfully");
  });

  it("should successfully update a project description", async () => {
    const res = await supertest(app)
      .put(`/projects/${projectId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ description: "Updated description" });

    expect(res.status).to.equal(200);
    expect(res.body.message).to.equal("Project updated successfully");
  });

  it("should successfully update multiple fields", async () => {
    const res = await supertest(app)
      .put(`/projects/${projectId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "New Name",
        description: "New Description",
        location: "Los Angeles",
      });

    expect(res.status).to.equal(200);
    expect(res.body.message).to.equal("Project updated successfully");
  });

  //   // --- ❌ Negative Test Cases ---
  it("should return 400 if no fields are provided", async () => {
    const res = await supertest(app)
      .put(`/projects/${projectId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({});

    expect(res.status).to.equal(400);
    expect(res.body.message).to.equal("Validation failed");

    // ✅ Check if the message inside `errors._errors` is correct
    expect(res.body.errors._errors[0]).to.equal(
      "At least one field (name, description, or location) must be provided."
    );
  });

  it("should return 400 if updating name to an already existing one", async () => {
    // Create another project
    await Project.create({
      name: "Existing Project",
      description: "Existing description",
      location: "Chicago",
      createdBy: userId.toString(),
      ownerEmail: "owner@example.com",
    });

    const res = await supertest(app)
      .put(`/projects/${projectId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ name: "Existing Project" });

    expect(res.status).to.equal(400);
    expect(res.body.message).to.equal(
      "Project name already exists. Please choose a different name."
    );
  });

  it("should return 400 if updating name with the same value", async () => {
    const res = await supertest(app)
      .put(`/projects/${projectId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ name: "Initial Project" });

    expect(res.status).to.equal(400);
    expect(res.body.message).to.equal(
      "Project name is already the same. No changes detected."
    );
  });

  it("should return 400 if project name is too short", async () => {
    const res = await supertest(app)
      .put(`/projects/${projectId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ name: "AB" });

    expect(res.status).to.equal(400);
    expect(res.body.message).to.equal("Validation failed");
    expect(res.body.errors.name._errors[0]).to.equal(
      "Project name must be at least 3 characters long"
    );
  });

  it("should return 400 if project location is too short", async () => {
    const res = await supertest(app)
      .put(`/projects/${projectId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ location: "NY" });

    expect(res.status).to.equal(400);
    expect(res.body.message).to.equal("Validation failed");
    expect(res.body.errors.location._errors[0]).to.equal(
      "Location must be at least 3 characters long"
    );
  });

  // --- 🛑 Edge Cases ---
  it("should return 400 for an invalid projectId format", async () => {
    const res = await supertest(app)
      .put(`/projects/invalid-id`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ name: "New Project Name" });

    expect(res.status).to.equal(400);
    expect(res.body.message).to.equal("Invalid project ID format.");
  });

  it("should return 404 if projectId does not exist", async () => {
    const nonExistingId = new mongoose.Types.ObjectId();
    const res = await supertest(app)
      .put(`/projects/${nonExistingId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ name: "New Name" });

    expect(res.status).to.equal(404);
    expect(res.body.message).to.equal("Project not found");
  });

  it("should return 403 if a different user tries to update the project", async () => {
    const differentUserToken = generateAccessToken({
      _id: new mongoose.Types.ObjectId().toString(),
      email: "otheruser@example.com",
      plan: "BASIC",
    });

    const res = await supertest(app)
      .put(`/projects/${projectId}`)
      .set("Authorization", `Bearer ${differentUserToken}`)
      .send({ name: "New Name" });

    expect(res.status).to.equal(403);
    expect(res.body.message).to.equal("Unauthorized to update this project");
  });

  it("should return 401 when no access token is provided", async () => {
    const res = await supertest(app).put(`/projects/${projectId}`).send({
      name: "Unauthorized Update",
    });

    expect(res.status).to.equal(401);
    expect(res.body.message).to.equal("Access token missing or invalid");
  });

  it("should return 403 when an expired access token is used", async () => {
    const expiredToken = generateAccessToken(
      { _id: userId.toString(), email: "owner@example.com" },
      "1ms"
    );

    const res = await supertest(app)
      .put(`/projects/${projectId}`)
      .set("Authorization", `Bearer ${expiredToken}`)
      .send({ name: "Expired Update" });

    expect(res.status).to.equal(403);
    expect(res.body.message).to.equal("Invalid or expired token");
  });
});
