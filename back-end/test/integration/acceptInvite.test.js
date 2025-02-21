// 🛠 Third-party modules
import * as chai from "chai";
import supertest from "supertest";
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import sinon from "sinon"; // Import sinon for stubbing and mocking

// 🚀 Core application modules
import app from "../../app.js"; // Import the app
import UserProjectMapping from "../../models/UserProjectMapping.js";
import { setupTestDB, teardownTestDB } from "../utils/setupTestDB.js";

// 📌 Configurations & Utilities
import { inviteStatus } from "../../config/constants.js";
import { messages } from "../../config/messages.js";
import { generateAccessToken } from "../../utils/jwtUtils.js";

const { expect } = chai;

describe("POST /projects/invite/accept", () => {
  let authToken;
  let userId;
  let inviteToken = uuidv4();
  let projectId;
  let inviteEmail = "invitee@example.com";

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
    const foundUser = {
      _id: userId.toString(),
      email: inviteEmail,
      plan: "BASIC",
    };
    authToken = generateAccessToken(foundUser);

    // Create an invite with a token
    const invite = await UserProjectMapping.create({
      projectId: new mongoose.Types.ObjectId(),
      role: "EDITOR",
      email: inviteEmail,
      inviteToken, // The invite token to be used in tests
      status: inviteStatus.INVITED,
      createdBy: userId,
    });

    inviteToken = invite.inviteToken;
    projectId = invite.projectId;
  });

  it("should return 200 if the invite is accepted successfully", async () => {
    const res = await supertest(app)
      .post("/projects/invite/accept")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        token: inviteToken, // Send the invite token
      });

    expect(res.status).to.equal(200);
    expect(res.body.message).to.equal(messages.INVITE.SUCCESSFULLY_JOINED);
  });

  it("should return 400 if the invite token is invalid or expired", async () => {
    const res = await supertest(app)
      .post("/projects/invite/accept")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        token: uuidv4(), // Send an invalid token
      });

    expect(res.status).to.equal(400);
    expect(res.body.message).to.equal(messages.INVITE.INVALID_OR_EXPIRED);
  });

  it("should return 403 if the email does not match the invited email", async () => {
    const foundUser = {
      _id: new mongoose.Types.ObjectId().toString(),
      email: "unauthorized@example.com",
      plan: "BASIC",
    };
    // Simulate a different user
    const unauthorizedUserToken = generateAccessToken(foundUser);

    const res = await supertest(app)
      .post("/projects/invite/accept")
      .set("Authorization", `Bearer ${unauthorizedUserToken}`)
      .send({
        token: inviteToken, // Send the correct invite token
      });

    expect(res.status).to.equal(403);
    expect(res.body.message).to.equal(messages.INVITE.UNAUTHORIZED);
  });

  it("should return 400 if the token is missing from the request body", async () => {
    const res = await supertest(app)
      .post("/projects/invite/accept")
      .set("Authorization", `Bearer ${authToken}`)
      .send({}); // Missing token field

    expect(res.status).to.equal(400);
    expect(res.body.error.token._errors).to.include("Required");
  });

  it("should return 500 if there is a server error", async () => {
    // Mocking the database method to throw an error
    const stub = sinon
      .stub(UserProjectMapping, "findOne")
      .throws(new Error("Something went wrong"));

    const res = await supertest(app)
      .post("/projects/invite/accept")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        token: uuidv4(), // This could still be any token for this test
      });

    expect(res.status).to.equal(500);
    expect(res.body.error).to.include("Something went wrong");

    // Restore the original function after the test
    stub.restore();
  });
});
