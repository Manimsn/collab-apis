import * as chai from "chai";
import supertest from "supertest";
import mongoose from "mongoose";
import sinon from "sinon";

import app from "../../../app.js";
import PostFolder from "../../../models/postFolderModel.js";
import { setupTestDB, teardownTestDB } from "../../utils/setupTestDB.js";
import { generateAccessToken } from "../../../utils/jwtUtils.js";
import { createPost } from "../../testData/postTestData.js";
import { createProject } from "../../testData/projectTestData.js";

const { expect } = chai;
const BASE_URL = "/post/rename";

describe("PATCH /post/rename", () => {
  let authToken, owner, folder, post, file, project;

  before(async () => {
    await setupTestDB();
  });

  after(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    owner = { _id: new mongoose.Types.ObjectId(), email: "user@example.com" };
    authToken = generateAccessToken({ _id: owner._id, email: owner.email });
    project = await createProject(owner._id, owner.email);

    folder = await createPost(project._id, owner._id, [], "FOLDER", null);

    post = await createPost(project._id, owner._id, [], "POST", folder._id);
    file = post.files[0]; //_id
  });

  it("should successfully update folder name", async () => {
    const res = await supertest(app)
      .put(`${BASE_URL}/${folder._id}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ name: "Updated Folder Name" });

    expect(res.status).to.equal(200);
    expect(res.body.message).to.equal("Update successful");
  });

  it("should successfully update file name in a post", async () => {
    const res = await supertest(app)
      .put(`${BASE_URL}/${post._id}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ name: "Updated File Name", fileId: file._id });

    expect(res.status).to.equal(200);
    expect(res.body.message).to.equal("Update successful");
  });

  it("should return 400 for missing name field", async () => {
    const res = await supertest(app)
      .put(`${BASE_URL}/${folder._id}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({});

    expect(res.status).to.equal(400);
    expect(res.body.message).to.equal("Validation failed");
  });

  it("should return 404 if post/folder not found", async () => {
    const res = await supertest(app)
      .put(`${BASE_URL}/${new mongoose.Types.ObjectId()}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ name: "New Name" });

    expect(res.status).to.equal(404);
    expect(res.body.message).to.equal("Post/Folder not found");
  });

  it("should return 403 for unauthorized user", async () => {
    const res = await supertest(app)
      .patch(`${BASE_URL}/${folder._id}/name`)
      .set("Authorization", "Bearer invalid_token")
      .send({ name: "New Name" });

    expect(res.status).to.equal(403);
    expect(res.body.message).to.equal("Invalid or expired token");
  });

  it("should return 403 if user is not authorized to update", async () => {
    const anotherUser = {
      _id: new mongoose.Types.ObjectId(),
      email: "anotheruser@example.com",
    };
    const anotherAuthToken = generateAccessToken({
      _id: anotherUser._id,
      email: anotherUser.email,
    });

    const res = await supertest(app)
      .put(`${BASE_URL}/${folder._id}`)
      .set("Authorization", `Bearer ${anotherAuthToken}`)
      .send({ name: "New Name" });

    expect(res.status).to.equal(403);
    expect(res.body.message).to.equal("Unauthorized to update this post");
  });

  it("should return 500 on server error", async () => {
    sinon.stub(PostFolder, "findById").throws(new Error("Database failure"));
    const res = await supertest(app)
      .put(`${BASE_URL}/${folder._id}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ name: "New Name" });

    expect(res.status).to.equal(500);
    expect(res.body.message).to.equal("Internal Server Error");
    PostFolder.findById.restore();
  });
});
