import * as chai from "chai";
import supertest from "supertest";
import mongoose from "mongoose";
import app from "../../app.js"; // Import the app
import { setupTestDB, teardownTestDB } from "../utils/setupTestDB.js";
import { generateAccessToken } from "../../utils/jwtUtils.js";
import PostFolder from "../../models/postFolderModel.js";
import sinon from "sinon"; // Import sinon for stubbing and mocking

const { expect } = chai;

describe("PUT /post/:postId - Update Post Description", () => {
  let authToken;
  let userId;
  let postId;

  before(async () => {
    await setupTestDB(); // Initialize test database
  });

  after(async () => {
    await teardownTestDB(); // Clean up database after tests
  });

  beforeEach(async () => {
    await PostFolder.deleteMany({}); // Clear the collection before each test

    // Create a test user
    userId = new mongoose.Types.ObjectId();

    // Generate an access token for the user
    const userPayload = {
      _id: userId.toString(),
      email: "user@example.com",
    };
    authToken = generateAccessToken(userPayload);

    // Create a test post
    const post = await PostFolder.create({
      type: "POST",
      name: "Test Post",
      description: "Initial Description",
      projectId: new mongoose.Types.ObjectId(),
      createdBy: userId,
      category: "Images",
      files: [],
    });

    postId = post._id.toString();
  });

  it("should successfully update the post description", async () => {
    const updatedDescription = "Updated post description";

    const res = await supertest(app)
      .put(`/post/${postId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ description: updatedDescription });

    expect(res.status).to.equal(200);
    expect(res.body.message).to.equal("Post updated successfully");
    expect(res.body.post.description).to.equal(updatedDescription);
  });

  it("should successfully update the tagged users", async () => {
    const updatedTaggedUsers = [
      "newuser@example.com",
      "anotheruser@example.com",
    ];

    const res = await supertest(app)
      .put(`/post/${postId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ taggedUsers: updatedTaggedUsers });

    expect(res.status).to.equal(200);
    expect(res.body.message).to.equal("Post updated successfully");
    expect(res.body.post.taggedEmails)
      .to.be.an("array")
      .that.includes.members(updatedTaggedUsers);
  });

  it("should successfully add new files to a post", async () => {
    const newFiles = [
      { name: "file1.pdf", description: "First file", fileType: "mp4" },
      { name: "file2.jpg", description: "Second file", fileType: "mp4" },
    ];

    const res = await supertest(app)
      .put(`/post/${postId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ newUploadedFiles: newFiles });

    expect(res.status).to.equal(200);
    expect(res.body.message).to.equal("Post updated successfully");
    expect(res.body.post.files).to.be.an("array").that.has.lengthOf(2);
    expect(res.body.post.files.map((file) => file.name)).to.include.members([
      "file1.pdf",
      "file2.jpg",
    ]);
  });

  it("should successfully update an existing file name/description", async () => {
    // First, create a file in the post
    const post = await PostFolder.findById(postId);
    const existingFile = {
      name: "oldFile.pdf",
      description: "Old description",
      fileType: "Old description",
    };
    post.files.push(existingFile);
    await post.save();

    // Retrieve the fileId of the newly added file
    const fileId = post.files[0]._id.toString();

    // Update request payload
    const updatedFiles = [
      {
        _id: fileId,
        name: "updatedFile.pdf",
        description: "Updated description",
      },
    ];

    const res = await supertest(app)
      .put(`/post/${postId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ existingFiles: updatedFiles });

    expect(res.status).to.equal(200);
    expect(res.body.message).to.equal("Post updated successfully");
    expect(res.body.post.files[0].name).to.equal("updatedFile.pdf");
    expect(res.body.post.files[0].description).to.equal("Updated description");
  });

  it("should successfully delete specified files from a post", async () => {
    // First, create files in the post
    const post = await PostFolder.findById(postId);
    const files = [
      {
        name: "file1.pdf",
        description: "First file",
        fileType: "img",
      },
      { name: "file2.jpg", description: "Second file", fileType: "img" },
    ];
    post.files.push(...files);
    await post.save();

    // Retrieve fileIds of the added files
    const fileIdsToDelete = post.files.map((file) => file._id.toString());

    const res = await supertest(app)
      .put(`/post/${postId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ deleteFileIds: fileIdsToDelete });

    expect(res.status).to.equal(200);
    expect(res.body.message).to.equal("Post updated successfully");
    expect(res.body.post.files).to.be.an("array").that.is.empty;
  });

  it("should successfully update only the description while keeping other fields unchanged", async () => {
    // Fetch the existing post before update
    const postBeforeUpdate = await PostFolder.findById(postId);
    const originalTaggedEmails = postBeforeUpdate.taggedEmails;
    const originalFiles = postBeforeUpdate.files;

    // Update request payload with only description
    const updatedDescription = "Updated post description";

    const res = await supertest(app)
      .put(`/post/${postId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ description: updatedDescription });

    expect(res.status).to.equal(200);
    expect(res.body.message).to.equal("Post updated successfully");
    expect(res.body.post.description).to.equal(updatedDescription);

    // Ensure other fields remain unchanged
    expect(res.body.post.taggedEmails).to.deep.equal(originalTaggedEmails);
    expect(res.body.post.files).to.deep.equal(originalFiles);
  });

  it("should successfully update description, tagged users, add new files, and delete specified files", async () => {
    // First, create initial files in the post
    const post = await PostFolder.findById(postId);
    const initialFiles = [
      { name: "file1.pdf", description: "First file", fileType: "img" },
      { name: "file2.jpg", description: "Second file", fileType: "img" },
    ];
    post.files.push(...initialFiles);
    await post.save();

    // Retrieve fileIds of the added files to delete one of them
    const fileIdsToDelete = [post.files[0]._id.toString()]; // Delete first file

    // Define updates
    const updatedDescription = "Updated post with multiple changes";
    const updatedTaggedUsers = [
      "newuser@example.com",
      "anotheruser@example.com",
    ];
    const newFiles = [
      { name: "newFile1.docx", description: "New document", fileType: "img" },
      { name: "newFile2.png", description: "New image file", fileType: "img" },
    ];

    const res = await supertest(app)
      .put(`/post/${postId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        description: updatedDescription,
        taggedUsers: updatedTaggedUsers,
        newUploadedFiles: newFiles,
        deleteFileIds: fileIdsToDelete,
      });

    expect(res.status).to.equal(200);
    expect(res.body.message).to.equal("Post updated successfully");

    // Check if description is updated
    expect(res.body.post.description).to.equal(updatedDescription);

    // Check if tagged users are updated
    expect(res.body.post.taggedEmails)
      .to.be.an("array")
      .that.includes.members(updatedTaggedUsers);

    // Check if specified file was deleted
    expect(res.body.post.files.map((file) => file.name)).to.not.include(
      "file1.pdf"
    );

    // Check if new files were added
    expect(res.body.post.files.map((file) => file.name)).to.include.members([
      "newFile1.docx",
      "newFile2.png",
    ]);
  });

  it("should return 400 if postId is not a valid ObjectId", async () => {
    const invalidPostId = "invalid-id"; // Not a valid MongoDB ObjectId

    const res = await supertest(app)
      .put(`/post/${invalidPostId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ description: "Trying to update with an invalid postId" });

    expect(res.status).to.equal(400);
    expect(res.body.error).to.equal("Invalid postId format");
  });

  it("should return 404 if the postId does not exist", async () => {
    const nonExistentPostId = new mongoose.Types.ObjectId().toString(); // Generate a valid but non-existent ObjectId

    const res = await supertest(app)
      .put(`/post/${nonExistentPostId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ description: "Trying to update a non-existent post" });

    expect(res.status).to.equal(404);
    expect(res.body.error).to.equal("Post not found");
  });

  it("should return 403 if the request is made without a valid JWT token", async () => {
    const res = await supertest(app)
      .put(`/post/${postId}`)
      .send({ description: "Unauthorized update attempt" }); // No Authorization header

    expect(res.status).to.equal(401);
    expect(res.body.message).to.equal("Access token missing or invalid");
  });

  it("should return 400 if trying to add files to a folder instead of a post", async () => {
    // Create a folder instead of a post
    const folder = await PostFolder.create({
      type: "FOLDER",
      name: "Test Folder",
      description: "Folder description",
      projectId: new mongoose.Types.ObjectId(),
      createdBy: userId,
      category: "Images",
      //   files: [], // Folders should not have files
    });

    const folderId = folder._id.toString();

    const newFiles = [
      {
        name: "file1.pdf",
        description: "Trying to add a file",
        fileType: "img",
      },
      {
        name: "file2.jpg",
        description: "This should not be allowed",
        fileType: "img",
      },
    ];

    const res = await supertest(app)
      .put(`/post/${folderId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ newUploadedFiles: newFiles });

    expect(res.status).to.equal(400);
    expect(res.body.error).to.equal(
      "Files can only be added to a post, not a folder"
    );
  });

  it("should return 400 if adding files exceeds the 20-file limit", async () => {
    // Create a post with 18 files already present
    const post = await PostFolder.create({
      type: "POST",
      name: "Test Post",
      description: "Post with files",
      projectId: new mongoose.Types.ObjectId(),
      createdBy: userId,
      category: "Images",
      files: Array.from({ length: 18 }, (_, i) => ({
        name: `file${i + 1}.pdf`,
        description: `File ${i + 1}`,
        fileType: "img",
      })), // Generates 18 files
    });

    const postIdWithFiles = post._id.toString();

    // Attempt to add 3 more files (exceeding the 20-file limit)
    const newFiles = [
      { name: "file19.pdf", description: "Extra file 1", fileType: "img" },
      { name: "file20.pdf", description: "Extra file 2", fileType: "img" },
      { name: "file21.pdf", description: "Extra file 3", fileType: "img" }, // This file exceeds the limit
    ];

    const res = await supertest(app)
      .put(`/post/${postIdWithFiles}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ newUploadedFiles: newFiles });

    expect(res.status).to.equal(400);
    expect(res.body.error).to.equal("A post cannot have more than 20 files");
  });

  it("should return 400 if existingFiles is missing _id", async () => {
    const post = await PostFolder.create({
      type: "POST",
      name: "Test Post",
      description: "Post for testing file updates",
      projectId: new mongoose.Types.ObjectId(),
      createdBy: userId,
      category: "Images",
      files: [
        {
          name: "existingFile.pdf",
          description: "Old description",
          fileType: "img",
        },
      ],
    });

    const postIdWithFiles = post._id.toString();

    // Attempting to update an existing file without `_id`
    const invalidExistingFiles = [
      {
        name: "updatedFile.pdf",
        description: "Updated description",
        fileType: "img",
      }, // Missing `_id`
    ];

    const res = await supertest(app)
      .put(`/post/${postIdWithFiles}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ existingFiles: invalidExistingFiles });

    expect(res.status).to.equal(400);
    expect(res.body.message).to.equal("Validation failed");
  });

  it("should return 400 if deleteFileIds contains an invalid ObjectId format", async () => {
    const post = await PostFolder.create({
      type: "POST",
      name: "Test Post",
      description: "Post for testing file deletion",
      projectId: new mongoose.Types.ObjectId(),
      createdBy: userId,
      category: "Images",
      files: [
        { name: "file1.pdf", description: "File to delete", fileType: "img" },
      ],
    });

    const postIdWithFiles = post._id.toString();

    // Invalid `_id` in deleteFileIds
    const invalidDeleteFileIds = ["invalid-id", "12345"]; // Not valid ObjectId

    const res = await supertest(app)
      .put(`/post/${postIdWithFiles}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ deleteFileIds: invalidDeleteFileIds });

    expect(res.status).to.equal(400);
    expect(res.body.message).to.equal("Validation failed");
  });

  it("should return 400 if the request body is empty", async () => {
    const res = await supertest(app)
      .put(`/post/${postId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({}); // Empty request body

    expect(res.status).to.equal(400);
    expect(res.body.message).to.equal("Validation failed");
  });

  it("should return 500 if a database error occurs during update", async () => {
    // Stub `findByIdAndUpdate` to simulate a database failure
    const stub = sinon
      .stub(PostFolder, "findByIdAndUpdate")
      .throws(new Error("Database failure"));

    const res = await supertest(app)
      .put(`/post/${postId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ description: "Simulated database failure" });

    expect(res.status).to.equal(500);
    expect(res.body.error).to.equal("Database failure");

    // Restore original method after test
    stub.restore();
  });

  it("should handle concurrent updates from multiple users correctly", async () => {
    // Create a post
    const post = await PostFolder.create({
      type: "POST",
      name: "Concurrent Update Post",
      description: "Initial Description",
      projectId: new mongoose.Types.ObjectId(),
      createdBy: userId,
      category: "Images",
      files: [],
    });

    const postIdForConcurrentTest = post._id.toString();

    // Create two different users
    const user1 = new mongoose.Types.ObjectId();
    const user2 = new mongoose.Types.ObjectId();

    const authToken1 = generateAccessToken({
      _id: user1.toString(),
      email: "user1@example.com",
    });
    const authToken2 = generateAccessToken({
      _id: user2.toString(),
      email: "user2@example.com",
    });

    // User 1 and User 2 send concurrent update requests
    const updateRequest1 = supertest(app)
      .put(`/post/${postIdForConcurrentTest}`)
      .set("Authorization", `Bearer ${authToken1}`)
      .send({ description: "User 1 Update" });

    const updateRequest2 = supertest(app)
      .put(`/post/${postIdForConcurrentTest}`)
      .set("Authorization", `Bearer ${authToken2}`)
      .send({ description: "User 2 Update" });

    // Run both updates concurrently
    const [res1, res2] = await Promise.all([updateRequest1, updateRequest2]);

    // Both requests should succeed
    expect(res1.status).to.equal(200);
    expect(res2.status).to.equal(200);

    // Fetch the latest post data from the database
    const updatedPost = await PostFolder.findById(postIdForConcurrentTest);

    // The final state should reflect one of the updates (last write wins in MongoDB)
    expect(["User 1 Update", "User 2 Update"]).to.include(
      updatedPost.description
    );
  });
});
