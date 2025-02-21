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
const BASE_URL = "/category/files/move-to-folder";

describe("updateFilesParentFolder Controller", () => {
  let user, token, postFolder, parentFolder, file1, file2, folder1, folder2;

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

    // Create a parent folder
    parentFolder = new PostFolder({
      type: "FOLDER",
      name: "Parent Folder",
      projectId: new mongoose.Types.ObjectId(),
      createdBy: user._id,
      category: "Images",
    });
    await parentFolder.save();

    // Create a post folder with files
    postFolder = new PostFolder({
      type: "POST",
      name: "Post Folder",
      projectId: new mongoose.Types.ObjectId(),
      createdBy: user._id,
      category: "Images",
      files: [
        {
          name: "File 1",
          parentFolderId: null,
          fileType: "PDF",
        },
        {
          name: "File 2",
          parentFolderId: null,
          fileType: "PDF",
        },
      ],
    });
    await postFolder.save();

    file1 = postFolder.files[0];
    file2 = postFolder.files[1];

    // Create some folders and links
    folder1 = new PostFolder({
      type: "FOLDER",
      name: "Folder 1",
      projectId: new mongoose.Types.ObjectId(),
      createdBy: user._id,
      category: "Images",
    });
    folder2 = new PostFolder({
      type: "FOLDER",
      name: "Folder 2",
      projectId: new mongoose.Types.ObjectId(),
      createdBy: user._id,
      category: "Images",
    });

    await folder1.save();
    await folder2.save();
  });

  afterEach(async () => {
    await PostFolder.deleteMany({});
    await User.deleteMany({});
  });

  it("should update parentFolderId for multiple files", async () => {
    const res = await supertest(app)
      .put(BASE_URL)
      .set("Authorization", `Bearer ${token}`)
      .send({
        parentFolderId: parentFolder._id.toString(),
        files: [
          { _id: file1._id.toString(), postId: postFolder._id.toString() },
          { _id: file2._id.toString(), postId: postFolder._id.toString() },
        ],
      });

    expect(res.status).to.equal(200);
    expect(res.body.success).to.be.true;
    expect(res.body.filesModified).to.equal(2);

    const updatedPostFolder = await PostFolder.findById(postFolder._id);
    expect(updatedPostFolder.files[0].parentFolderId.toString()).to.equal(
      parentFolder._id.toString()
    );
    expect(updatedPostFolder.files[1].parentFolderId.toString()).to.equal(
      parentFolder._id.toString()
    );
  });

  it("should update parentFolderId for multiple folders and links", async () => {
    const res = await supertest(app)
      .put(BASE_URL)
      .set("Authorization", `Bearer ${token}`)
      .send({
        parentFolderId: parentFolder._id.toString(),
        folderAndLinks: [folder1._id.toString(), folder2._id.toString()],
      });

    expect(res.status).to.equal(200);
    expect(res.body.success).to.be.true;
    expect(res.body.foldersModified).to.equal(2);

    const updatedFolder1 = await PostFolder.findById(folder1._id);
    const updatedFolder2 = await PostFolder.findById(folder2._id);

    expect(updatedFolder1.parentFolderId.toString()).to.equal(
      parentFolder._id.toString()
    );
    expect(updatedFolder2.parentFolderId.toString()).to.equal(
      parentFolder._id.toString()
    );
  });

  it("should return 400 if parentFolderId is invalid", async () => {
    const res = await supertest(app)
      .put(BASE_URL)
      .set("Authorization", `Bearer ${token}`)
      .send({
        parentFolderId: "invalidId",
        files: [
          { _id: file1._id.toString(), postId: postFolder._id.toString() },
          { _id: file2._id.toString(), postId: postFolder._id.toString() },
        ],
      });

    expect(res.status).to.equal(400);
    expect(res.body.message).to.equal("Validation failed");
  });

  it("should return 400 if parentFolderId is not a folder", async () => {
    const res = await supertest(app)
      .put(BASE_URL)
      .set("Authorization", `Bearer ${token}`)
      .send({
        parentFolderId: postFolder._id.toString(),
        files: [
          { _id: file1._id.toString(), postId: postFolder._id.toString() },
          { _id: file2._id.toString(), postId: postFolder._id.toString() },
        ],
      });

    expect(res.status).to.equal(400);
    expect(res.body.message).to.equal(
      "Invalid parentFolderId. It must be a FOLDER."
    );
  });

  it("should return 400 if neither files nor folderAndLinks are provided", async () => {
    const res = await supertest(app)
      .put(BASE_URL)
      .set("Authorization", `Bearer ${token}`)
      .send({
        parentFolderId: parentFolder._id.toString(),
      });

    expect(res.status).to.equal(400);
    expect(res.body.message).to.equal("Validation failed");
  });

    it("should return 500 on server error", async () => {
      sinon.stub(PostFolder, "bulkWrite").throws(new Error("Database failure"));

      const res = await supertest(app)
        .put(BASE_URL)
        .set("Authorization", `Bearer ${token}`)
        .send({
          parentFolderId: parentFolder._id.toString(),
          files: [
            { _id: file1._id.toString(), postId: postFolder._id.toString() },
            { _id: file2._id.toString(), postId: postFolder._id.toString() },
          ],
        });

      expect(res.status).to.equal(500);
      expect(res.body.message).to.equal("Database failure");
      PostFolder.bulkWrite.restore();
    });
});
