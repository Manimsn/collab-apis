import * as chai from "chai";
import supertest from "supertest";
import app from "../../app.js"; // Import the app
import Project from "../../models/Project.js";
import UserProjectMapping from "../../models/UserProjectMapping.js";
import { setupTestDB, teardownTestDB } from "../utils/setupTestDB.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { inviteStatus } from "../../config/constants.js";
import { messages } from "../../config/messages.js";

const { expect } = chai;

describe("POST /projects/:projectId/invite", () => {
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
    await Project.deleteMany({});
    await UserProjectMapping.deleteMany({});

    // Create a mock user ID
    userId = new mongoose.Types.ObjectId();

    // Create a project
    const project = await Project.create({
      name: "Test Project",
      description: "A test project",
      location: "New York",
      createdBy: userId,
      ownerEmail: "owner@example.com",
    });

    projectId = project._id.toString();
    // Generate a valid access token
    authToken = jwt.sign(
      {
        UserInfo: {
          userId: userId.toString(),
          email: "owner@example.com",
          plan: "BASIC",
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" }
    );
  });

  // --- Positive Test Case ---
  it("should successfully send an invite to a user", async () => {
    const res = await supertest(app)
      .post(`/projects/${projectId}/invite`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        email: "invitee@example.com",
        role: "EDITOR",
      });

    expect(res.status).to.equal(200);
    expect(res.body.message).to.equal(messages.INVITE.SENT_SUCCESS);
  });

  // --- Negative Test Cases ---
  it("should return 400 if the invited user is already a project member", async () => {
    await UserProjectMapping.create({
      email: "existingUser@example.com",
      projectId: projectId,
      role: "EDITOR",
      status: inviteStatus.ACCEPTED,
      createdBy: userId,
    });

    const res = await supertest(app)
      .post(`/projects/${projectId}/invite`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        email: "existingUser@example.com",
        role: "EDITOR",
      });
    expect(res.status).to.equal(400);
    expect(res.body.message).to.equal(messages.INVITE.ALREADY_MEMBER);
  });

  it("should return 400 if inviting the project owner", async () => {
    const res = await supertest(app)
      .post(`/projects/${projectId}/invite`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        email: "owner@example.com",
        role: "ADMIN",
      });

    expect(res.status).to.equal(400);
    expect(res.body.message).to.equal(messages.PROJECT.INVITE_OWNER_ERROR);
  });

  it("should return 401 if no access token is provided", async () => {
    const res = await supertest(app)
      .post(`/projects/${projectId}/invite`)
      .send({
        email: "invitee@example.com",
        role: "EDITOR",
      });

    expect(res.status).to.equal(401);
    // expect(res.body.message).to.equal(messages.AUTH.UNAUTHORIZED);
    expect(res.body.message).to.equal("Access token missing or invalid");
  });

  it("should return 403 if the user is not the project owner or an admin", async () => {
    // Generate an unauthorized user token
    const unauthorizedToken = jwt.sign(
      {
        UserInfo: {
          userId: new mongoose.Types.ObjectId().toString(),
          email: "otherUser@example.com",
          plan: "BASIC",
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" }
    );

    const res = await supertest(app)
      .post(`/projects/${projectId}/invite`)
      .set("Authorization", `Bearer ${unauthorizedToken}`)
      .send({
        email: "invitee@example.com",
        role: "EDITOR",
      });

    expect(res.status).to.equal(403);
    expect(res.body.message).to.equal(messages.PROJECT.INVITE_PERMISSION_ERROR);
  });

  it("should return 403 if the project has reached its member limit", async () => {
    // Create max members allowed for BASIC plan
    for (let i = 0; i < 5; i++) {
      await UserProjectMapping.create({
        email: `user${i}@example.com`,
        projectId: projectId,
        role: "VIEWER",
        status: inviteStatus.ACCEPTED,
        createdBy: userId,
      });
    }

    const res = await supertest(app)
      .post(`/projects/${projectId}/invite`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        email: "extraUser@example.com",
        role: "EDITOR",
      });

    expect(res.status).to.equal(403);
    expect(res.body.message).to.equal(
      messages.PROJECT.MAX_MEMBERS_REACHED("BASIC", 5)
    );
  });

  it("should return 404 if the project does not exist", async () => {
    const nonExistentProjectId = new mongoose.Types.ObjectId().toString();

    const res = await supertest(app)
      .post(`/projects/${nonExistentProjectId}/invite`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        email: "invitee@example.com",
        role: "EDITOR",
      });

    expect(res.status).to.equal(404);
    expect(res.body.message).to.equal(messages.PROJECT.NOT_FOUND);
  });

  it("should return 400 if email is missing in request body", async () => {
    const res = await supertest(app)
      .post(`/projects/${projectId}/invite`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        role: "EDITOR",
      });

    expect(res.status).to.equal(400);
    // expect(res.body.message).to.equal("Validation failed");
    expect(res.body.error.email._errors).to.include("Required");
  });

  it("should return 400 if role is missing in request body", async () => {
    const res = await supertest(app)
      .post(`/projects/${projectId}/invite`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        email: "invitee@example.com",
      });

    expect(res.status).to.equal(400);
    // expect(res.body.message).to.equal("Validation failed");
    expect(res.body.error.role._errors).to.include("Required");
  });

  it("should return 403 when using an expired access token", async () => {
    const expiredToken = jwt.sign(
      { userId: userId.toString(), email: "owner@example.com", plan: "BASIC" },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1ms" } // Expired immediately
    );

    const res = await supertest(app)
      .post(`/projects/${projectId}/invite`)
      .set("Authorization", `Bearer ${expiredToken}`)
      .send({
        email: "invitee@example.com",
        role: "EDITOR",
      });

    expect(res.status).to.equal(403);
    // expect(res.body.message).to.equal(messages.AUTH.FORBIDDEN);
    expect(res.body.message).to.equal("Invalid or expired token");
  });
});
