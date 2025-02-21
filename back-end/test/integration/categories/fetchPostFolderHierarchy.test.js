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
const BASE_URL = "/category";

describe("GET /post/fetch-hierarchy", () => {
  let authToken,
    owner,
    project,
    folder,
    subFolder,
    postWithDifferentParent,
    post,
    fileA,
    fileB;

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

    folder = await createPost(
      project._id,
      owner._id,
      [],
      "FOLDER",
      null,
      "Images"
    );
    subFolder = await createPost(
      project._id,
      owner._id,
      [],
      "FOLDER",
      folder._id,
      "Images"
    );

    postWithDifferentParent = await createPost(
      project._id,
      owner._id,
      [],
      "POST",
      folder._id,
      "Images",
      [
        {
          name: "File A",
          fileType: "IMAGE",
          parentFolderId: subFolder._id,
        },
        { name: "File B", fileType: "IMAGE" }, // Should default to post.parentFolderId
      ],
      true
    );
    post = await createPost(
      project._id,
      owner._id,
      [],
      "POST",
      folder._id,
      "Images",
      [{ fileId: "file_103", name: "File C", fileType: "PDF" }],
      false
    );
  });

  it("should successfully return a hierarchical structure", async () => {
    const res = await supertest(app)
      .get(`${BASE_URL}`)
      .query({ projectId: project._id.toString(), category: "Images" })
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).to.equal(200);
    expect(res.body).to.be.an("array");

    const rootFolder = res.body.find(
      (item) => item._id === folder._id.toString()
    );
    expect(rootFolder).to.have.property("children").that.is.an("array");

    const subFolderItem = rootFolder.children.find(
      (item) => item._id === subFolder._id.toString()
    );

    expect(subFolderItem).to.exist;
    expect(subFolderItem.children.some((file) => file.name === "File A")).to.be
      .true;
  });

  it("should attach post files to the correct parent when hasDifferentParent is true", async () => {
    const res = await supertest(app)
      .get(`${BASE_URL}`)
      .query({ projectId: project._id.toString(), category: "Images" })
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).to.equal(200);

    const subFolderItem = res.body
      .find((item) => item._id === folder._id.toString())
      .children.find((item) => item._id === subFolder._id.toString());

    expect(subFolderItem.children.some((file) => file.name === "File A")).to.be
      .true;
    expect(res.body.some((file) => file.name === folder.name)).to.be.true; // Root-level file
  });

  it("should return 400 for missing projectId", async () => {
    const res = await supertest(app)
      .get(`${BASE_URL}`)
      .query({ category: "posts" })
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).to.equal(400);
    expect(res.body.message).to.equal("Validation failed");
  });

  it("should return 400 for invalid projectId", async () => {
    const res = await supertest(app)
      .get(`${BASE_URL}`)
      .query({ projectId: "invalid_id", category: "posts" })
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).to.equal(400);
    expect(res.body.message).to.equal("Validation failed");
  });

  it("should return 404 if no records found", async () => {
    const newProject = await createProject(owner._id, owner.email);
    const res = await supertest(app)
      .get(`${BASE_URL}`)
      .query({ projectId: newProject._id.toString(), category: "posts" })
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).to.equal(404);
    expect(res.body.message).to.equal("No records found.");
  });

  it("should return 500 on server error", async () => {
    sinon.stub(PostFolder, "find").throws(new Error("Database failure"));
    const res = await supertest(app)
      .get(`${BASE_URL}`)
      .query({ projectId: project._id.toString(), category: "posts" })
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).to.equal(500);
    expect(res.body.message).to.equal("Internal Server Error");
    PostFolder.find.restore();
  });
});
