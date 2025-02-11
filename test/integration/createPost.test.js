// 🛠 Third-party modules
import * as chai from "chai";
import supertest from "supertest";
import mongoose from "mongoose";
import sinon from "sinon"; // Import sinon for stubbing and mocking

// 🚀 Core application modules
import app from "../../app.js"; // Import the Express app
import PostFolder from "../../models/postFolderModel.js";
import Project from "../../models/Project.js";
import { setupTestDB, teardownTestDB } from "../utils/setupTestDB.js";
import { generateAccessToken } from "../../utils/jwtUtils.js";
import { messages } from "../../config/messages.js";
import { categoryEnum, FILETYPE } from "../../config/constants.js"; // Import category list
import UserProjectMapping from "../../models/UserProjectMapping.js";

const { expect } = chai;

describe("POST /posts", () => {
  let authToken;
  let userId;
  let projectId;
  let authStub;

  before(async () => {
    await setupTestDB(); // Setup in-memory MongoDB
  });

  after(async () => {
    await teardownTestDB(); // Teardown in-memory MongoDB
  });

  beforeEach(async () => {
    await PostFolder.deleteMany({}); // Clear posts collection before each test
    await Project.deleteMany({}); // Clear projects collection before each test

    // Create a mock user ID
    userId = new mongoose.Types.ObjectId();

    // Generate a valid access token
    const foundUser = {
      _id: userId.toString(),
      email: "user@example.com",
    };
    authToken = generateAccessToken(foundUser);

    // Create a mock project in the database
    const project = await Project.create({
      name: "Test Project",
      description: "A test project for post creation",
      location: "New York",
      createdBy: userId,
      ownerEmail: "user@example.com",
    });

    projectId = project._id.toString(); // Convert project ID to string for request
  });

  it("should return 201 when a post is created successfully", async () => {
    const postData = {
      type: FILETYPE.POST, // Must be POST, FOLDER, or LINK
      name: "Sample Post",
      projectId: projectId, // Must exist in the database
      category: categoryEnum[0], // Must be from categoryEnum
      description: "This is a test post",
      files: [{ name: "test.pdf", fileType: "pdf" }],
    };

    const res = await supertest(app)
      .post("/post")
      .set("Authorization", `Bearer ${authToken}`)
      .send(postData);

    expect(res.status).to.equal(201);
    expect(res.body.message).to.equal("POST created successfully");
    expect(res.body).to.have.property("postId");
  });

  it("should return 201 when a folder is created successfully", async () => {
    const folderData = {
      type: FILETYPE.FOLDER, // Must be FOLDER
      name: "Sample Folder", // Required for folders
      projectId: projectId, // Must exist in the database
      category: categoryEnum[0], // Must be from categoryEnum
      description: "This is a test folder",
    };

    const res = await supertest(app)
      .post("/post")
      .set("Authorization", `Bearer ${authToken}`)
      .send(folderData);

    expect(res.status).to.equal(201);
    expect(res.body.message).to.equal("FOLDER created successfully");
    expect(res.body).to.have.property("postId");
  });

  it("should return 201 when a post is created inside an existing folder", async () => {
    // First, create a folder to use as parentFolderId
    const parentFolder = await PostFolder.create({
      type: FILETYPE.FOLDER,
      name: "Parent Folder",
      projectId: projectId,
      createdBy: userId,
      category: categoryEnum[0],
    });

    const postData = {
      type: FILETYPE.POST, // Must be POST
      name: "Post inside Folder",
      projectId: projectId, // Must exist in the database
      parentFolderId: parentFolder._id.toString(), // Must reference an existing folder
      category: categoryEnum[1], // Must be from categoryEnum
      description: "This is a post inside an existing folder",
      files: [{ name: "test.pdf", fileType: "pdf" }],
    };

    const res = await supertest(app)
      .post("/post")
      .set("Authorization", `Bearer ${authToken}`)
      .send(postData);

    expect(res.status).to.equal(201);
    expect(res.body.message).to.equal("POST created successfully");
    expect(res.body).to.have.property("postId");
  });

  it("should return 201 when a folder is created inside an existing folder", async () => {
    // First, create a parent folder
    const parentFolder = await PostFolder.create({
      type: FILETYPE.FOLDER,
      name: "Parent Folder",
      projectId: projectId,
      createdBy: userId,
      category: categoryEnum[0],
    });

    const folderData = {
      type: FILETYPE.FOLDER, // Must be FOLDER
      name: "Nested Folder",
      projectId: projectId, // Must exist in the database
      parentFolderId: parentFolder._id.toString(), // Must reference an existing folder
      category: categoryEnum[1], // Must be from categoryEnum
      description: "This is a nested folder",
    };

    const res = await supertest(app)
      .post("/post")
      .set("Authorization", `Bearer ${authToken}`)
      .send(folderData);

    expect(res.status).to.equal(201);
    expect(res.body.message).to.equal("FOLDER created successfully");
    expect(res.body).to.have.property("postId");
  });

  it("should return 201 when the project owner creates a post", async () => {
    // Create a project where the user is the owner
    const project = await Project.create({
      name: "Owner's Project",
      description: "Project owned by the user",
      location: "San Francisco",
      createdBy: userId, // The user is the project owner
      ownerEmail: "user@example.com",
    });

    const postData = {
      type: FILETYPE.POST, // Must be POST
      name: "Owner's Post",
      projectId: project._id.toString(), // Must exist in the database
      category: categoryEnum[2], // Must be from categoryEnum
      description: "Post created by the project owner",
      files: [{ name: "owner_doc.pdf", fileType: "pdf" }],
    };

    const res = await supertest(app)
      .post("/post")
      .set("Authorization", `Bearer ${authToken}`)
      .send(postData);

    expect(res.status).to.equal(201);
    expect(res.body.message).to.equal("POST created successfully");
    expect(res.body).to.have.property("postId");
  });

  it("should return 201 when an Admin or Editor creates a post", async () => {
    // Create a project
    const project = await Project.create({
      name: "Admin/Editor Project",
      description: "Project where user is an Admin or Editor",
      location: "Los Angeles",
      createdBy: new mongoose.Types.ObjectId(), // Different user is the owner
      ownerEmail: "owner@example.com",
    });

    // Assign the user as an Admin or Editor in UserProjectMapping
    await UserProjectMapping.create({
      email: "user@example.com",
      projectId: project._id.toString(),
      role: "EDITOR", // or "ADMIN"
      createdBy: new mongoose.Types.ObjectId(),
    });

    const postData = {
      type: FILETYPE.POST, // Must be POST
      name: "Admin's Post",
      projectId: project._id.toString(), // Must exist in the database
      category: categoryEnum[3], // Must be from categoryEnum
      description: "Post created by an Admin/Editor",
      files: [{ name: "admin_doc.pdf", fileType: "pdf" }],
    };

    const res = await supertest(app)
      .post("/post")
      .set("Authorization", `Bearer ${authToken}`)
      .send(postData);

    expect(res.status).to.equal(201);
    expect(res.body.message).to.equal("POST created successfully");
    expect(res.body).to.have.property("postId");
  });

  // #### **Negative Test Cases**
  it("should return 400 when required fields are missing", async () => {
    const incompletePostData = {
      type: FILETYPE.POST, // Missing 'name' and 'projectId'
      category: categoryEnum[4], // Must be from categoryEnum
      description: "This post is missing required fields",
      files: [{ name: "invalid_doc.pdf", fileType: "pdf" }],
    };

    const res = await supertest(app)
      .post("/post")
      .set("Authorization", `Bearer ${authToken}`)
      .send(incompletePostData);

    expect(res.status).to.equal(400);
    expect(res.body.message).to.equal("Validation failed");
    expect(res.body).to.have.property("errors");
  });

  it("should return 404 when the project does not exist", async () => {
    const nonExistentProjectId = new mongoose.Types.ObjectId().toString(); // Generate a random project ID

    const postData = {
      type: FILETYPE.POST, // Must be POST
      name: "Post with Invalid Project",
      projectId: nonExistentProjectId, // Non-existent projectId
      category: categoryEnum[5], // Must be from categoryEnum
      description: "This post is associated with a non-existent project",
      files: [{ name: "invalid_project.pdf", fileType: "pdf" }],
    };

    const res = await supertest(app)
      .post("/post")
      .set("Authorization", `Bearer ${authToken}`)
      .send(postData);

    expect(res.status).to.equal(404);
    expect(res.body.message).to.equal("Project not found.");
  });

  it("should return 403 when the user is not authorized to create a post", async () => {
    // Create a project where the user is NOT the owner
    const project = await Project.create({
      name: "Unauthorized Project",
      description: "Project where the user has no access",
      location: "London",
      createdBy: new mongoose.Types.ObjectId(), // Different owner
      ownerEmail: "owner@example.com",
    });

    // Do NOT add the user to UserProjectMapping (no access)

    const postData = {
      type: FILETYPE.POST, // Must be POST
      name: "Unauthorized Post",
      projectId: project._id.toString(), // Must exist in the database
      category: categoryEnum[6], // Must be from categoryEnum
      description: "User should not have permission to create this post",
      files: [{ name: "unauthorized_doc.pdf", fileType: "pdf" }],
    };

    const res = await supertest(app)
      .post("/post")
      .set("Authorization", `Bearer ${authToken}`)
      .send(postData);

    expect(res.status).to.equal(403);
    expect(res.body.message).to.equal("Unauthorized to create this post");
  });

  it("should return 400 when parentFolderId refers to a non-existent folder", async () => {
    const nonExistentFolderId = new mongoose.Types.ObjectId().toString(); // Generate a random folder ID

    // Create a valid project
    const project = await Project.create({
      name: "Project with Missing Parent Folder",
      description: "Testing missing parent folder scenario",
      location: "Berlin",
      createdBy: userId,
      ownerEmail: "user@example.com",
    });

    const postData = {
      type: FILETYPE.POST, // Must be POST
      name: "Post with Missing Parent Folder",
      projectId: project._id.toString(), // Must exist in the database
      parentFolderId: nonExistentFolderId, // Non-existent folder ID
      category: categoryEnum[7], // Must be from categoryEnum
      description: "This post references a missing parent folder",
      files: [{ name: "missing_folder_doc.pdf", fileType: "pdf" }],
    };

    const res = await supertest(app)
      .post("/post")
      .set("Authorization", `Bearer ${authToken}`)
      .send(postData);

    expect(res.status).to.equal(400);
    expect(res.body.message).to.equal("Parent folder not found.");
  });

  it("should return 400 when parentFolderId refers to a post instead of a folder", async () => {
    // Create a valid project
    const project = await Project.create({
      name: "Project with Parent as Post",
      description: "Testing scenario where parent is a post",
      location: "Madrid",
      createdBy: userId,
      ownerEmail: "user@example.com",
    });

    // Create a post (which should NOT be used as a parent folder)
    const parentPost = await PostFolder.create({
      type: FILETYPE.POST, // This should be a FOLDER instead
      name: "Invalid Parent Post",
      projectId: project._id.toString(),
      createdBy: userId,
      category: categoryEnum[8],
      files: [{ name: "parent_post_doc.pdf", fileType: "pdf" }],
    });

    const postData = {
      type: FILETYPE.POST, // Must be POST
      name: "Post with Invalid Parent",
      projectId: project._id.toString(), // Must exist in the database
      parentFolderId: parentPost._id.toString(), // Incorrect parent (should be a folder)
      category: categoryEnum[9], // Must be from categoryEnum
      description: "This post references an invalid parent (which is a post)",
      files: [{ name: "invalid_parent_post_doc.pdf", fileType: "pdf" }],
    };

    const res = await supertest(app)
      .post("/post")
      .set("Authorization", `Bearer ${authToken}`)
      .send(postData);

    expect(res.status).to.equal(400);
    expect(res.body.message).to.equal("Parent must be a folder, not a post.");
  });

  it("should return 403 when the user does not have access to the project", async () => {
    // Create a project where the user is NOT assigned
    const project = await Project.create({
      name: "Restricted Project",
      description: "Testing scenario where user has no access",
      location: "Toronto",
      createdBy: new mongoose.Types.ObjectId(), // Different owner
      ownerEmail: "owner@example.com",
    });

    // DO NOT add the user to UserProjectMapping (ensuring no access)

    const postData = {
      type: FILETYPE.POST, // Must be POST
      name: "Unauthorized Post",
      projectId: project._id.toString(), // Must exist in the database
      category: categoryEnum[10], // Must be from categoryEnum
      description: "User does not have access to this project",
      files: [{ name: "unauthorized_project_doc.pdf", fileType: "pdf" }],
    };

    const res = await supertest(app)
      .post("/post")
      .set("Authorization", `Bearer ${authToken}`)
      .send(postData);

    expect(res.status).to.equal(403);
    expect(res.body.message).to.equal("Unauthorized to create this post");
  });

  it("should return 500 when there is a database error while checking the project", async () => {
    // Stub the checkProjectExists function to throw an error
    const projectStub = sinon
      .stub(Project, "findOne")
      .throws(new Error("Database error"));

    const postData = {
      type: FILETYPE.POST, // Must be POST
      name: "Post with DB Error",
      projectId: new mongoose.Types.ObjectId().toString(), // Simulated projectId
      category: categoryEnum[0], // Must be from categoryEnum
      description:
        "This test simulates a database failure when checking project",
      files: [{ name: "db_error_doc.pdf", fileType: "pdf" }],
    };

    const res = await supertest(app)
      .post("/post")
      .set("Authorization", `Bearer ${authToken}`)
      .send(postData);

    expect(res.status).to.equal(500);
    expect(res.body.message).to.equal("Internal Server Error");

    // Restore the stubbed method
    projectStub.restore();
  });

  it("should return 500 when there is a database error while saving the post/folder", async () => {
    // Create a project where the user is authorized
    const project = await Project.create({
      name: "Project with Save DB Error",
      description: "Simulated save failure",
      location: "Dubai",
      createdBy: userId, // Ensure the user is the owner
      ownerEmail: "user@example.com",
    });

    // Assign the user as an Admin or Editor to bypass authorization failure
    await UserProjectMapping.create({
      email: "user@example.com",
      projectId: project._id.toString(),
      role: "EDITOR",
      createdBy: new mongoose.Types.ObjectId(),
    });

    // Stub the save method of PostFolder to throw an error
    const saveStub = sinon
      .stub(PostFolder.prototype, "save")
      .throws(new Error("Database save error"));

    const postData = {
      type: FILETYPE.POST, // Must be POST
      name: "Post with Save DB Error",
      projectId: project._id.toString(), // Must exist in the database
      category: categoryEnum[2], // Must be from categoryEnum
      description: "Simulated save failure in database",
      files: [{ name: "save_db_error_doc.pdf", fileType: "pdf" }],
    };

    const res = await supertest(app)
      .post("/post")
      .set("Authorization", `Bearer ${authToken}`)
      .send(postData);

    expect(res.status).to.equal(500);
    expect(res.body.message).to.equal("Internal Server Error");

    // Restore the stubbed method
    saveStub.restore();
  });
});
