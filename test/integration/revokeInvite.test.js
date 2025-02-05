import * as chai from "chai";
import supertest from "supertest";
import app from "../../app.js"; // Import the app
import UserProjectMapping from "../../models/UserProjectMapping.js";
import { setupTestDB, teardownTestDB } from "../utils/setupTestDB.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import sinon from "sinon"; // Import sinon for stubbing and mocking
import { v4 as uuidv4 } from "uuid";
import { inviteStatus } from "../../config/constants.js";
import { messages } from "../../config/messages.js";

const { expect } = chai;

describe("DELETE /projects/:projectId/invite", () => {
  let authToken;
  let userId;
  let projectId;
  let inviteEmail = "invitee@example.com";
  let inviteToken;

  before(async () => {
    await setupTestDB(); // Setup in-memory MongoDB
  });

  after(async () => {
    await teardownTestDB(); // Teardown in-memory MongoDB
  });

  beforeEach(async () => {
    await UserProjectMapping.deleteMany({}); // Clear the UserProjectMapping collection before each test

    // Create a mock user ID
    userId = new mongoose.Types.ObjectId();

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

    // Create an invite with a token
    const invite = await UserProjectMapping.create({
      projectId: new mongoose.Types.ObjectId(),
      email: inviteEmail,
      inviteToken: uuidv4(), // The invite token to be used in tests
      status: inviteStatus.INVITED,
      role: "EDITOR",
      createdBy: userId,
    });

    inviteToken = invite.inviteToken;
    projectId = invite.projectId;
  });

  it("should return 200 if the invite is revoked successfully", async () => {
    const res = await supertest(app)
      .delete(`/projects/${projectId}/invite`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        email: inviteEmail, // Send the email of the invitee
      });

    expect(res.status).to.equal(200);
    expect(res.body.message).to.equal(messages.INVITE.REVOKED_SUCCESS);
  });

  it("should return 400 if the email format is invalid", async () => {
    const res = await supertest(app)
      .delete(`/projects/${projectId}/invite`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        email: "", // Invalid email (empty)
      });

    expect(res.status).to.equal(400);
    expect(res.body.message).to.equal("Invalid email format or missing email.");
  });

  it("should return 400 if the projectId is invalid", async () => {
    const invalidProjectId = "invalidProjectId";

    const res = await supertest(app)
      .delete(`/projects/${invalidProjectId}/invite`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        email: inviteEmail,
      });

    expect(res.status).to.equal(400);
    expect(res.body.message).to.equal("Invalid projectId format.");
  });

  it("should return 400 if the invite does not exist or has been used", async () => {
    // Modify the invite status to something else (e.g., ACCEPTED) before revoking
    await UserProjectMapping.updateOne(
      { email: inviteEmail },
      { $set: { status: "ACCEPTED" } }
    );

    const res = await supertest(app)
      .delete(`/projects/${projectId}/invite`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        email: inviteEmail,
      });

    expect(res.status).to.equal(400);
    expect(res.body.message).to.equal("Invite not found or already used.");
  });

  it("should return 500 if there is a server error", async () => {
    // Mocking the database method to throw an error
    const stub = sinon
      .stub(UserProjectMapping, "findOne")
      .throws(new Error("Something went wrong"));

    const res = await supertest(app)
      .delete(`/projects/${projectId}/invite`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        email: inviteEmail,
      });

    expect(res.status).to.equal(500);
    expect(res.body.error).to.include("Something went wrong");

    // Restore the original function after the test
    stub.restore();
  });
});
