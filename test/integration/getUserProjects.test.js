// 🛠 Third-party modules
import * as chai from "chai";
import supertest from "supertest";
import mongoose from "mongoose";

// 🚀 Core application modules
import app from "../../app.js"; // Import the app
import Project from "../../models/Project.js";
import UserProjectMapping from "../../models/UserProjectMapping.js";

// 📌 Configurations & Utilities
import { setupTestDB, teardownTestDB } from "../utils/setupTestDB.js";
import { generateAccessToken } from "../../utils/jwtUtils.js";
import { deleteUsers, insertUsers } from "../data/users.js";
import { deleteProjects, insertProjects } from "../data/projects.js";

const { expect } = chai;

describe("GET /api/projects (Fetching User Projects)", () => {
  let authToken, invitedUserToken;
  let ownerId, invitedUserId;
  let invitedUserEmail = "invited@example.com";
  let projectOwned, projectInvited;

  before(async () => {
    await setupTestDB(); // Setup in-memory MongoDB
  });

  after(async () => {
    await teardownTestDB(); // Teardown in-memory MongoDB
  });

  beforeEach(async () => {
    await deleteUsers(); // Clean existing users
    await insertUsers(); // Insert predefined users

    await deleteProjects(); // Clean existing projects
    await insertProjects(); // Insert predefined projects

    const authToken = generateAccessToken({
      _id: users.ownerUser._id,
      email: users.ownerUser.email,
    });
  });

  // ✅ **1. Fetch owned and invited projects**
  it("should return owned and invited projects sorted by updatedAt", async () => {
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
    expect(res.body[0]).to.have.property("name", "Owned Project");
    expect(res.body[0]).to.have.property("role", "owner"); // Only owned projects get "owner" role
    expect(res.body[1]).to.have.property("name", "Invited Project");
  });
});
