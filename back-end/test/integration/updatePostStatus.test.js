import * as chai from "chai";
import supertest from "supertest";
import mongoose from "mongoose";
import app from "../../app.js"; // Import the Express app
import { setupTestDB, teardownTestDB } from "../utils/setupTestDB.js";
import { generateAccessToken } from "../../utils/jwtUtils.js";
import PostFolder from "../../models/postFolderModel.js";

const { expect } = chai;

describe("PUT /post-folder/:postId/status - Update Post/Folder Status", () => {
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

  /** ✅ Positive Test Cases **/

  it("should successfully update isBlocker", async () => {
    const res = await supertest(app)
      .put(`/post/${postId}/status`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ isBlocker: true });

    expect(res.status).to.equal(200);
    expect(res.body.message).to.equal("isBlocker updated successfully.");
    expect(res.body.updatedPost.isBlocker).to.be.true;
  });

  it("should successfully update isFeed", async () => {
    const res = await supertest(app)
      .put(`/post/${postId}/status`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ isFeed: false });

    expect(res.status).to.equal(200);
    expect(res.body.message).to.equal("isFeed updated successfully.");
    expect(res.body.updatedPost.isFeed).to.be.false;
  });

  /** ❌ Negative Test Cases **/

  it("should return 400 when both isBlocker and isFeed are provided", async () => {
    const res = await supertest(app)
      .put(`/post/${postId}/status`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ isBlocker: true, isFeed: false });

    expect(res.status).to.equal(400);
    expect(res.body.message).to.equal(
      "Only one field (isBlocker or isFeed) should be provided."
    );
  });

  it("should return 400 when neither isBlocker nor isFeed is provided", async () => {
    const res = await supertest(app)
      .put(`/post/${postId}/status`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({});

    expect(res.status).to.equal(400);
    expect(res.body.message).to.equal(
      "Only one field (isBlocker or isFeed) should be provided."
    );
  });

  it("should return 400 when isBlocker is not a boolean", async () => {
    const res = await supertest(app)
      .put(`/post/${postId}/status`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ isBlocker: "true" });

    expect(res.status).to.equal(400);
    expect(res.body.message).to.include("Expected boolean, received string");
  });

  it("should return 400 when isFeed is not a boolean", async () => {
    const res = await supertest(app)
      .put(`/post/${postId}/status`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ isFeed: 1 });

    expect(res.status).to.equal(400);
    expect(res.body.message).to.include("Expected boolean, received number");
  });

  it("should return 403 if user is not the post owner", async () => {
    // Create a post with a different user as the owner
    const anotherUserId = new mongoose.Types.ObjectId();
    const anotherPost = await PostFolder.create({
      type: "POST",
      name: "Another Post",
      description: "Different User's Post",
      projectId: new mongoose.Types.ObjectId(),
      createdBy: anotherUserId,
      category: "Images",
      files: [],
    });

    const anotherPostId = anotherPost._id.toString();

    const res = await supertest(app)
      .put(`/post/${anotherPostId}/status`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ isBlocker: true });

    expect(res.status).to.equal(403);
    expect(res.body.message).to.equal("Unauthorized to update this post.");
  });

  it("should return 404 if post does not exist", async () => {
    const nonExistentPostId = new mongoose.Types.ObjectId().toString();

    const res = await supertest(app)
      .put(`/post/${nonExistentPostId}/status`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ isFeed: true });

    expect(res.status).to.equal(404);
    expect(res.body.message).to.equal("Post not found.");
  });

  it("should return 401 if no authentication token is provided", async () => {
    const res = await supertest(app)
      .put(`/post/${postId}/status`)
      .send({ isBlocker: true });

    expect(res.status).to.equal(401);
    expect(res.body.message).to.equal("Access token missing or invalid");
  });
});
