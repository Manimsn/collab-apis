// 🛠 Third-party modules
import * as chai from "chai";
import supertest from "supertest";
import mongoose from "mongoose";

// 🚀 Core application modules
import app from "../../app.js";
import Project from "../../models/Project.js";
import UserProjectMapping from "../../models/UserProjectMapping.js";

// 📌 Configurations & Utilities
import { setupTestDB, teardownTestDB } from "../utils/setupTestDB.js";
import { generateAccessToken } from "../../utils/jwtUtils.js";
import { inviteStatus, planLimits, ROLES } from "../../config/constants.js";
import { messages } from "../../config/messages.js";

// ✅ Extract reusable methods & payloads
const { expect } = chai;

const TEST_USER = {
  email: "invitee@example.com",
  role: ROLES.EDITOR,
};

const createProject = async (ownerId, ownerEmail) => {
  return await Project.create({
    name: "Test Project",
    description: "A test project",
    location: "New York",
    createdBy: ownerId,
    ownerEmail,
  });
};

describe("POST /projects/:projectId/invite", () => {
  let authToken;
  let userId;
  let projectId;

  before(async () => {
    await setupTestDB();
  });

  after(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    await Project.deleteMany({});
    await UserProjectMapping.deleteMany({});

    userId = new mongoose.Types.ObjectId();
    const project = await createProject(userId, "owner@example.com");
    projectId = project._id.toString();

    const foundUser = {
      _id: userId.toString(),
      email: "owner@example.com",
      plan: "BASIC",
    };
    authToken = generateAccessToken(foundUser);
  });

  // ✅ Positive Test Cases
  it("should successfully send an invite for project-level access", async () => {
    const res = await supertest(app)
      .post(`/projects/${projectId}/invite`)
      .set("Authorization", `Bearer ${authToken}`)
      .send(TEST_USER);

    expect(res.status).to.equal(200);
    expect(res.body.message).to.equal(messages.INVITE.SENT_SUCCESS);
  });

  it("should successfully send an invite for category-level access", async () => {
    const res = await supertest(app)
      .post(`/projects/${projectId}/invite`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ ...TEST_USER, category: "Renderings" });

    expect(res.status).to.equal(200);
    expect(res.body.message).to.equal(messages.INVITE.SENT_SUCCESS);
  });

  // ✅ Successfully send an invite for file/folder-level access
  it("should successfully send an invite for file/folder-level access", async () => {
    const fileOrFolderId = new mongoose.Types.ObjectId(); // Generate ObjectId

    const res = await supertest(app)
      .post(`/projects/${projectId}/invite`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        email: TEST_USER.email,
        category: "Files",
        fileOrFolderAccess: [{ fileOrFolderId, role: ROLES.EDITOR }],
      });

    expect(res.status).to.equal(200);
    expect(res.body.message).to.equal(messages.INVITE.SENT_SUCCESS);
  });

  // ✅ Successfully update an existing invite with additional file/folder access
  it("should successfully update an existing invite with additional file/folder access", async () => {
    const existingFileId = new mongoose.Types.ObjectId();
    const newFileId = new mongoose.Types.ObjectId();

    await UserProjectMapping.create({
      email: TEST_USER.email,
      projectId: projectId,
      // categoryAccess: [{ category: "Files", role: ROLES.VIEWER }],
      category: "Files",
      fileOrFolderAccess: [
        {
          category: "Files",
          files: [{ fileOrFolderId: existingFileId, role: ROLES.VIEWER }],
        },
      ],
      status: inviteStatus.INVITED,
      createdBy: userId,
    });

    const res = await supertest(app)
      .post(`/projects/${projectId}/invite`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        email: TEST_USER.email,
        category: "Files",
        fileOrFolderAccess: [{ fileOrFolderId: newFileId, role: ROLES.EDITOR }],
      });

    expect(res.status).to.equal(200);
    expect(res.body.message).to.equal(messages.INVITE.SENT_SUCCESS);
  });

  // ✅ Partially update access when some files already exist in the user's access list
  it("should partially update access when some files already exist", async () => {
    const existingFileId = new mongoose.Types.ObjectId();
    const newFileId = new mongoose.Types.ObjectId();

    const check = await UserProjectMapping.create({
      email: TEST_USER.email,
      projectId: projectId,
      fileOrFolderAccess: [
        {
          category: "Files",
          files: [{ fileOrFolderId: existingFileId, role: ROLES.VIEWER }],
        },
      ],
      status: inviteStatus.INVITED,
      createdBy: userId,
    });

    const res = await supertest(app)
      .post(`/projects/${projectId}/invite`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        email: TEST_USER.email,
        category: "Files",
        fileOrFolderAccess: [
          { fileOrFolderId: existingFileId, role: ROLES.EDITOR }, // Already exists
          { fileOrFolderId: newFileId, role: ROLES.VIEWER }, // New file
        ],
      });

    expect(res.status).to.equal(200);
    expect(res.body.message).to.equal(
      messages.INVITE.SOME_FILES_OR_FOLDERS_GRANTED_ACCESS(1, 1)
    );
  });

  // ❌ Negative Test Cases
  it("should return 400 if inviting the project owner", async () => {
    const res = await supertest(app)
      .post(`/projects/${projectId}/invite`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ ...TEST_USER, email: "owner@example.com" });

    expect(res.status).to.equal(400);
    expect(res.body.message).to.equal(messages.PROJECT.INVITE_OWNER_ERROR);
  });

  it("should return 400 if the invited user is already a project member", async () => {
    await UserProjectMapping.create({
      email: TEST_USER.email,
      projectId: projectId,
      role: TEST_USER.role,
      status: inviteStatus.ACCEPTED,
      createdBy: userId,
    });

    const res = await supertest(app)
      .post(`/projects/${projectId}/invite`)
      .set("Authorization", `Bearer ${authToken}`)
      .send(TEST_USER);

    expect(res.status).to.equal(400);
    expect(res.body.message).to.equal(messages.INVITE.ALREADY_MEMBER);
  });

  it("should return 403 if the user is not the project owner", async () => {
    const unauthorizedToken = generateAccessToken({
      _id: new mongoose.Types.ObjectId().toString(),
      email: "otherUser@example.com",
      plan: "BASIC",
    });

    const res = await supertest(app)
      .post(`/projects/${projectId}/invite`)
      .set("Authorization", `Bearer ${unauthorizedToken}`)
      .send(TEST_USER);

    expect(res.status).to.equal(403);
    expect(res.body.message).to.equal(messages.PROJECT.INVITE_PERMISSION_ERROR);
  });

  it("should return 403 if the project has reached its member limit", async () => {
    for (let i = 0; i < planLimits.BASIC.maxMembersPerProject; i++) {
      await UserProjectMapping.create({
        email: `user${i}@example.com`,
        projectId: projectId,
        role: ROLES.VIEWER,
        status: inviteStatus.ACCEPTED,
        createdBy: userId,
      });
    }

    const res = await supertest(app)
      .post(`/projects/${projectId}/invite`)
      .set("Authorization", `Bearer ${authToken}`)
      .send(TEST_USER);

    expect(res.status).to.equal(403);
    expect(res.body.message).to.equal(
      messages.PROJECT.MAX_MEMBERS_REACHED(
        "BASIC",
        planLimits.BASIC.maxMembersPerProject
      )
    );
  });

  it("should return 404 if the project does not exist", async () => {
    const nonExistentProjectId = new mongoose.Types.ObjectId().toString();

    const res = await supertest(app)
      .post(`/projects/${nonExistentProjectId}/invite`)
      .set("Authorization", `Bearer ${authToken}`)
      .send(TEST_USER);

    expect(res.status).to.equal(404);
    expect(res.body.message).to.equal(messages.PROJECT.NOT_FOUND);
  });

  it("should return 400 if email is missing in request body", async () => {
    const res = await supertest(app)
      .post(`/projects/${projectId}/invite`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ role: TEST_USER.role });

    expect(res.status).to.equal(400);
    expect(res.body.error.email._errors).to.include("Required");
  });

  // TODO
  // it("should return 400 if role is missing in request body", async () => {
  //   const res = await supertest(app)
  //     .post(`/projects/${projectId}/invite`)
  //     .set("Authorization", `Bearer ${authToken}`)
  //     .send({ email: TEST_USER.email });

  //   console.log(res.status);
  //   console.log(res.body);

  //   expect(res.status).to.equal(400);
  //   expect(res.body.error.role._errors).to.include("Required");
  // });

  it("should return 401 if no access token is provided", async () => {
    const res = await supertest(app)
      .post(`/projects/${projectId}/invite`)
      .send(TEST_USER);

    expect(res.status).to.equal(401);
    expect(res.body.message).to.equal("Access token missing or invalid");
  });

  it("should return 403 if the authentication token is invalid", async () => {
    const res = await supertest(app)
      .post(`/projects/${projectId}/invite`)
      .set("Authorization", "Bearer invalid.token")
      .send(TEST_USER);

    expect(res.status).to.equal(403);
    expect(res.body.message).to.equal("Invalid or expired token");
  });

  it("should return 403 if using an expired access token", async () => {
    const expiredToken = generateAccessToken(userId, "1ms");

    const res = await supertest(app)
      .post(`/projects/${projectId}/invite`)
      .set("Authorization", `Bearer ${expiredToken}`)
      .send(TEST_USER);

    expect(res.status).to.equal(403);
    expect(res.body.message).to.equal("Invalid or expired token");
  });

  // ❌ Return 400 if the user already has access to the requested category
  it("should return 400 if the user already has category-level access", async () => {
    const check = await UserProjectMapping.create({
      email: TEST_USER.email,
      projectId: projectId,
      categoryAccess: [{ category: "Files", role: ROLES.VIEWER }],
      status: inviteStatus.INVITED,
      createdBy: userId,
    });

    const res = await supertest(app)
      .post(`/projects/${projectId}/invite`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ email: TEST_USER.email, category: "Files", role: ROLES.EDITOR });

    expect(res.status).to.equal(400);
    expect(res.body.message).to.equal(
      messages.INVITE.CATEGORY_ALREADY_HAS_ACCESS
    );
  });

  // ❌ Return 400 if all requested files are already accessible
  it("should return 400 if all requested files are already accessible", async () => {
    const existingFileId = new mongoose.Types.ObjectId();

    await UserProjectMapping.create({
      email: TEST_USER.email,
      projectId: projectId,
      fileOrFolderAccess: [
        {
          category: "Files",
          files: [{ fileOrFolderId: existingFileId, role: ROLES.VIEWER }],
        },
      ],
      status: inviteStatus.INVITED,
      createdBy: userId,
    });

    const res = await supertest(app)
      .post(`/projects/${projectId}/invite`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        email: TEST_USER.email,
        category: "Files",
        fileOrFolderAccess: [
          { fileOrFolderId: existingFileId, role: ROLES.VIEWER },
        ],
      });

    expect(res.status).to.equal(400);
    expect(res.body.message).to.equal(
      messages.INVITE.ALREADY_HAS_FILE_OR_FOLDER_ACCESS(1)
    );
  });

  // // ❌ Return 403 if the category has reached its max members limit
  it("should return 403 if the category has reached its max members limit", async () => {
    for (let i = 0; i < planLimits.BASIC.maxMembersPerProjectExternal; i++) {
      await UserProjectMapping.create({
        email: `user${i}@example.com`,
        projectId: projectId,
        categoryAccess: [{ category: "Files", role: ROLES.VIEWER }],
        status: inviteStatus.ACCEPTED,
        createdBy: userId,
      });
    }

    const res = await supertest(app)
      .post(`/projects/${projectId}/invite`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        email: "newUser@example.com",
        category: "Files",
        role: ROLES.EDITOR,
      });

    expect(res.status).to.equal(403);
    expect(res.body.message).to.equal(
      messages.PROJECT.MAX_CATEGORY_MEMBERS_REACHED(
        "BASIC",
        planLimits.BASIC.maxMembersPerProjectExternal
      )
    );
  });
});
