// 🛠 Third-party modules
import * as chai from "chai";
import supertest from "supertest";
import mongoose from "mongoose";
import sinon from "sinon";
// 🚀 Core application modules
import app from "../../app.js"; // Import the app

// 📌 Configurations & Utilities
import { setupTestDB, teardownTestDB } from "../utils/setupTestDB.js";
import { generateAccessToken } from "../../utils/jwtUtils.js";
import { createUser } from "../testData/userTestData.js";
import { createProject } from "../testData/projectTestData.js";
import { createUserProjectMapping } from "../testData/userProjectMappingTestData.js";
import Project from "../../models/Project.js";

const { expect } = chai;

describe("GET /projects (Fetching User Projects)", () => {
  let authToken;
  let userOneDetails, invitingUserDetails, project1, project2, shareProject;

  before(async () => {
    await setupTestDB(); // Setup in-memory MongoDB
  });

  after(async () => {
    await teardownTestDB(); // Teardown in-memory MongoDB
  });

  beforeEach(async () => {
    userOneDetails = await createUser();
    invitingUserDetails = await createUser();

    project1 = await createProject(userOneDetails._id, userOneDetails.email);
    project2 = await createProject(
      invitingUserDetails._id,
      invitingUserDetails.email
    );

    authToken = generateAccessToken({
      _id: userOneDetails._id,
      email: userOneDetails.email,
    });
  });

  // ✅ **1. Fetch owned and invited projects**
  it("should return owned and invited projects sorted by updatedAt", async () => {
    shareProject = await createUserProjectMapping(
      userOneDetails.email,
      project2._id,
      invitingUserDetails._id,
      "ADMIN",
      "invited"
    );

    const res = await supertest(app)
      .get(`/projects`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).to.equal(200);
    expect(res.body).to.be.an("array");
    expect(res.body).to.have.length(2); // Should return only owned & invited projects

    // ✅ Validate sorting order (latest first)
    for (let i = 1; i < res.body.length; i++) {
      const prevDate = new Date(res.body[i - 1].updatedAt);
      const currDate = new Date(res.body[i].updatedAt);
      expect(prevDate).to.be.at.least(currDate); // ✅ Ensures sorting order is correct
    }

    // ✅ Validate structure
    expect(res.body[0]).to.have.property("name", project2.name);
    expect(res.body[1]).to.have.property("role", "owner"); // Only owned projects get "owner" role
    expect(res.body[1]).to.have.property("name", project1.name);
  });

  it("should return an empty array when the user has no owned or invited projects", async () => {
    // Generate a new user with no projects
    const newUser = await createUser();
    const newAuthToken = generateAccessToken({
      _id: newUser._id,
      email: newUser.email,
    });

    const res = await supertest(app)
      .get(`/projects`)
      .set("Authorization", `Bearer ${newAuthToken}`);

    expect(res.status).to.equal(200);
    expect(res.body).to.be.an("array").that.is.empty; // ✅ Should return an empty array
  });

  it("should return only owned projects when the user has not been invited to any", async () => {
    const res = await supertest(app)
      .get(`/projects`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).to.equal(200);
    expect(res.body).to.be.an("array").that.has.length(1);

    // ✅ Validate the response structure
    expect(res.body[0]).to.have.property("name", project1.name);
    expect(res.body[0]).to.have.property("role", "owner"); // ✅ Owned projects should have role "owner"
  });

  it("should return only invited projects when the user owns none", async () => {
    // Generate a new user that has been invited but doesn't own any projects
    const onlyIntivitedUser = await createUser();
    const invitedProject = await createProject(
      invitingUserDetails._id,
      invitingUserDetails.email
    );

    await createUserProjectMapping(
      onlyIntivitedUser.email,
      invitedProject._id,
      invitingUserDetails._id,
      "ADMIN",
      "invited"
    );

    const onlyIntivitedToken = generateAccessToken({
      _id: onlyIntivitedUser._id,
      email: onlyIntivitedUser.email,
    });

    const res = await supertest(app)
      .get(`/projects`)
      .set("Authorization", `Bearer ${onlyIntivitedToken}`);

    expect(res.status).to.equal(200);
    expect(res.body).to.be.an("array").that.has.length(1);

    // ✅ Validate response structure
    expect(res.body[0]).to.have.property("name", invitedProject.name);
    expect(res.body[0]).to.not.have.property("role", "owner"); // ✅ Only owned projects get "owner" role
  });

  it("should return 401 if authorization token is missing", async () => {
    const res = await supertest(app).get(`/projects`); // No Auth Header

    expect(res.status).to.equal(401);
    expect(res.body).to.have.property(
      "message",
      "Access token missing or invalid"
    );
  });

  it("should return 403 if the token is invalid", async () => {
    const res = await supertest(app)
      .get(`/projects`)
      .set("Authorization", `Bearer invalid_token`);

    expect(res.status).to.equal(403);
    expect(res.body).to.have.property("message", "Invalid or expired token");
  });

  it("should return 500 if there is a database error", async () => {
    sinon.stub(Project, "find").throws(new Error("Database failure"));

    const res = await supertest(app)
      .get(`/projects`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).to.equal(500);
    expect(res.body).to.have.property("message", "Internal Server Error");

    // Restore original behavior
    Project.find.restore();
  });
});
