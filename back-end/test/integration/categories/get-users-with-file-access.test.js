import * as chai from "chai";
import supertest from "supertest";
import mongoose from "mongoose";
import sinon from "sinon";

import app from "../../../app.js";
import User from "../../../models/User.js";
import UserProjectMapping from "../../../models/UserProjectMapping.js";
import { generateAccessToken } from "../../../utils/jwtUtils.js";

import { setupTestDB, teardownTestDB } from "../../utils/setupTestDB.js";
import { createUser } from "../../testData/userTestData.js";

const { expect } = chai;
const BASE_URL = "/category/files/access";

describe("getUsersWithFileAccess Controller", () => {
  let user, user2, token, projectId, category, fileOrFolderId;

  before(async () => {
    await setupTestDB();
  });

  after(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    // Create a user and generate a token
    user = await createUser();
    token = generateAccessToken({
      _id: user._id,
      email: user.email,
    });

    // Set up test data
    projectId = new mongoose.Types.ObjectId();
    category = "Images";
    fileOrFolderId = new mongoose.Types.ObjectId();

    // Create UserProjectMapping
    await UserProjectMapping.create({
      projectId,
      email: user.email,
      createdBy: new mongoose.Types.ObjectId(),
      fileOrFolderAccess: [
        {
          category,
          files: [{ fileOrFolderId, role: "VIEWER" }],
        },
      ],
      status: "invited",
    });

    // Create another user
    user2 = await createUser();

    // Create UserProjectMapping for another user
    await UserProjectMapping.create({
      projectId,
      email: user2.email,
      createdBy: new mongoose.Types.ObjectId(),
      fileOrFolderAccess: [
        {
          category,
          files: [{ fileOrFolderId, role: "VIEWER" }],
        },
      ],
      status: "invited",
    });
  });

  afterEach(async () => {
    await User.deleteMany({});
    await UserProjectMapping.deleteMany({});
  });

  it("should fetch users with file access", async () => {
    const res = await supertest(app)
      .get(BASE_URL)
      .set("Authorization", `Bearer ${token}`)
      .query({
        projectId: projectId.toString(),
        category,
        fileOrFolderId: fileOrFolderId.toString(),
      });

    expect(res.status).to.equal(200);
    expect(res.body.users).to.have.lengthOf(2);
    expect(res.body.users[0].email).to.be.oneOf([user.email, user2.email]);
    expect(res.body.users[1].email).to.be.oneOf([user.email, user2.email]);
  });

  it("should return 400 if projectId, category, or fileOrFolderId is missing", async () => {
    const res = await supertest(app)
      .get(BASE_URL)
      .set("Authorization", `Bearer ${token}`)
      .query({ projectId: projectId.toString(), category });

    expect(res.status).to.equal(400);
    expect(res.body.message).to.equal("Validation failed");
  });

  it("should return 404 if no users are found with file access", async () => {
    const res = await supertest(app)
      .get(BASE_URL)
      .set("Authorization", `Bearer ${token}`)
      .query({
        projectId: projectId.toString(),
        category: "NonExistentCategory",
        fileOrFolderId: fileOrFolderId.toString(),
      });

    expect(res.status).to.equal(404);
    expect(res.body.message).to.equal("No users found with file access");
  });

  it("should return 500 on server error", async () => {
    sinon
      .stub(UserProjectMapping, "find")
      .throws(new Error("Database failure"));

    const res = await supertest(app)
      .get(BASE_URL)
      .set("Authorization", `Bearer ${token}`)
      .query({
        projectId: projectId.toString(),
        category,
        fileOrFolderId: fileOrFolderId.toString(),
      });

    expect(res.status).to.equal(500);
    expect(res.body.message).to.equal("Internal server error");
    UserProjectMapping.find.restore();
  });
});
