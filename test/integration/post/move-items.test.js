import * as chai from "chai";
import supertest from "supertest";
import mongoose from "mongoose";
import sinon from "sinon";

import app from "../../../app.js";
import PostFolder from "../../../models/postFolderModel.js";
import User from "../../../models/User.js";
import { generateAccessToken } from "../../../utils/jwtUtils.js";

import { setupTestDB, teardownTestDB } from "../../utils/setupTestDB.js";
import { createUser } from "../../testData/userTestData.js";

const { expect } = chai;
const BASE_URL = "/post/move-items";

describe("updateParentFolderId Controller", () => {
  let user, token, postFolder1, postFolder2, parentFolder;

  before(async () => {
    await setupTestDB();
  });

  after(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    // Create a user and generate a token
    user = await createUser();
    console.log("user------", user);
    token = generateAccessToken({
      _id: user._id,
      email: user.email,
    });

    // Create some post folders
    postFolder1 = new PostFolder({
      type: "POST",
      name: "Manish",
      projectId: new mongoose.Types.ObjectId(),
      createdBy: user._id,
      category: "Images",
    });
    postFolder2 = new PostFolder({
      type: "POST",
      name: "Manish1",
      projectId: new mongoose.Types.ObjectId(),
      createdBy: user._id,
      category: "Images",
    });
    parentFolder = new PostFolder({
      type: "FOLDER",
      name: "Manish11",
      projectId: new mongoose.Types.ObjectId(),
      createdBy: user._id,
      category: "Images",
    });

    await postFolder1.save();
    await postFolder2.save();
    await parentFolder.save();
  });

  afterEach(async () => {
    await PostFolder.deleteMany({});
    await User.deleteMany({});
  });

  it("should update parentFolderId for multiple items", async () => {
    const res = await supertest(app)
      .put(`${BASE_URL}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        ids: [postFolder1._id, postFolder2._id],
        parentFolderId: parentFolder._id.toString(),
      });

    expect(res.status).to.equal(200);
    expect(res.body.message).to.equal("Parent folder ID updated successfully");

    const updatedPostFolder1 = await PostFolder.findById({
      _id: postFolder1._id,
    });
    const updatedPostFolder2 = await PostFolder.findById({
      _id: postFolder2._id,
    });

    expect(updatedPostFolder1.parentFolderId.toString()).to.equal(
      parentFolder._id.toString()
    );
    expect(updatedPostFolder2.parentFolderId.toString()).to.equal(
      parentFolder._id.toString()
    );
  });

  it("should return 404 if one or more items are not found", async () => {
    const res = await supertest(app)
      .put(`${BASE_URL}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        ids: [
          postFolder1._id.toString(),
          new mongoose.Types.ObjectId().toString(),
        ],
        parentFolderId: parentFolder._id.toString(),
      });

    expect(res.status).to.equal(404);
    expect(res.body.message).to.equal("One or more items not found");
  });

  it("should return 404 if parent folder is not found", async () => {
    const res = await supertest(app)
      .put(`${BASE_URL}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        ids: [postFolder1._id.toString(), postFolder2._id.toString()],
        parentFolderId: new mongoose.Types.ObjectId().toString(),
      });

    expect(res.status).to.equal(404);
    expect(res.body.message).to.equal("Parent folder not found");
  });

  it("should return 403 if user is not authorized to update an item", async () => {
    const anotherUser = await createUser();

    await anotherUser.save();
    const anotherToken = generateAccessToken({
      _id: anotherUser._id,
      email: anotherUser.email,
    });
    const res = await supertest(app)
      .put(`${BASE_URL}`)
      .set("Authorization", `Bearer ${anotherToken}`)
      .send({
        ids: [postFolder1._id.toString(), postFolder2._id.toString()],
        parentFolderId: parentFolder._id.toString(),
      });

    expect(res.status).to.equal(403);
    expect(res.body.message).to.equal("Unauthorized to update this post");
  });

  it("should return 500 on server error", async () => {
    sinon.stub(PostFolder, "find").throws(new Error("Database failure"));

    const res = await supertest(app)
      .put(`${BASE_URL}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        ids: [postFolder1._id.toString(), postFolder2._id.toString()],
        parentFolderId: parentFolder._id.toString(),
      });

    expect(res.status).to.equal(500);
    expect(res.body.message).to.equal("Error updating parent folder ID");
    PostFolder.find.restore();
  });
});
