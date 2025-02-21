import * as chai from "chai";
import supertest from "supertest";

import sinon from "sinon";

import app from "../../../app.js";
import PostFolder from "../../../models/postFolderModel.js";
import Project from "../../../models/Project.js";
import UserProjectMapping from "../../../models/UserProjectMapping.js";
import User from "../../../models/User.js";
import { generateAccessToken } from "../../../utils/jwtUtils.js";

import { setupTestDB, teardownTestDB } from "../../utils/setupTestDB.js";
import { createUser } from "../../testData/userTestData.js";
import { categories } from "../../../config/constants.js";

const { expect } = chai;
const BASE_URL = "/post/api/posts";

describe("fetchPosts Controller", () => {
  let user, user2, token, project, project2, post1, post2, post3, post4;

  before(async () => {
    await setupTestDB();
  });

  after(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    // Create a user and generate a token
    user = await createUser();
    user2 = await createUser();
    token = generateAccessToken({
      _id: user._id,
      email: user.email,
    });

    // Create a project
    project = new Project({
      name: "Test Project",
      createdBy: user._id,
      ownerEmail: user.email,
      location: "New York",
    });
    await project.save();

    project2 = new Project({
      name: "Test Project 2",
      createdBy: user2._id,
      ownerEmail: user2.email,
      location: "Boston",
    });
    await project2.save();

    // Create some posts
    post1 = new PostFolder({
      projectId: project._id,
      createdBy: user._id,
      isFeed: true,
      category: categories.DRAWINGS,
      taggedEmails: ["test1@example.com"],
      type: "POST",
    });

    post2 = new PostFolder({
      projectId: project._id,
      createdBy: user._id,
      isFeed: true,
      isBlocker: true,
      category: categories.DRAWINGS,
      taggedEmails: ["test2@example.com"],
      type: "POST",
    });

    post3 = new PostFolder({
      projectId: project._id,
      createdBy: user._id,
      isFeed: true,
      category: categories.DRAWINGS,
      taggedEmails: ["test3@example.com"],
      type: "POST",
    });

    post4 = new PostFolder({
      projectId: project2._id,
      createdBy: user2._id,
      isFeed: true,
      category: categories.DRAWINGS,
      taggedEmails: ["test13@example.com"],
      type: "POST",
    });

    await post1.save();
    await post2.save();
    await post3.save();
    await post4.save();
  });

  afterEach(async () => {
    await PostFolder.deleteMany({});
    await Project.deleteMany({});
    await User.deleteMany({});
    await UserProjectMapping.deleteMany({});
  });

  it("should fetch posts for a specific projectId with isFeed = true", async () => {
    const res = await supertest(app)
      .get(BASE_URL)
      .set("Authorization", `Bearer ${token}`)
      .query({ projectId: project._id.toString(), type: "ACTIVITIES" });

    expect(res.status).to.equal(200);
    expect(res.body.posts).to.have.lengthOf(3);
  });

  it("should fetch posts for a specific projectId with both isFeed = true and isBlocker = true", async () => {
    const res = await supertest(app)
      .get(BASE_URL)
      .set("Authorization", `Bearer ${token}`)
      .query({ projectId: project._id.toString(), type: "DECISION" });

    expect(res.status).to.equal(200);
    expect(res.body.posts).to.have.lengthOf(1);
    expect(res.body.posts[0].isBlocker).to.be.true;
  });

  it("should fetch all projects the user owns and has access to, and fetch posts with isFeed = true", async () => {
    const userProjectMapping = new UserProjectMapping({
      email: user.email,
      projectId: project2._id,
      createdBy: user2._id,
      role: "ADMIN",
    });
    await userProjectMapping.save();

    const res = await supertest(app)
      .get(BASE_URL)
      .set("Authorization", `Bearer ${token}`)
      .query({ type: "FEED" });

    expect(res.status).to.equal(200);
    expect(res.body.posts).to.have.lengthOf(4);
  });

  it("should apply filters correctly", async () => {
    const res = await supertest(app)
      .get(BASE_URL)
      .set("Authorization", `Bearer ${token}`)
      .query({
        projectId: project._id.toString(),
        type: "ACTIVITIES",
        createdBy: user._id.toString(),
        categories: categories.DRAWINGS,
        taggedEmails: "test1@example.com",
      });

    expect(res.status).to.equal(200);
    expect(res.body.posts).to.have.lengthOf(1);
    expect(res.body.posts[0].taggedEmails).to.include("test1@example.com");
  });

  it("should support pagination", async () => {
    const res = await supertest(app)
      .get(BASE_URL)
      .set("Authorization", `Bearer ${token}`)
      .query({
        projectId: project._id.toString(),
        type: "ACTIVITIES",
        page: "1",
        limit: "2",
      });

    expect(res.status).to.equal(200);
    expect(res.body.posts).to.have.lengthOf(2);
    expect(res.body.pagination.totalPosts).to.equal(3);
    expect(res.body.pagination.totalPages).to.equal(2);
  });

  it("should support sorting", async () => {
    const res = await supertest(app)
      .get(BASE_URL)
      .set("Authorization", `Bearer ${token}`)
      .query({
        projectId: project._id.toString(),
        type: "ACTIVITIES",
        sortOrder: "asc",
      });

    expect(res.status).to.equal(200);
    expect(res.body.posts).to.have.lengthOf(3);
    expect(new Date(res.body.posts[0].createdAt)).to.be.below(
      new Date(res.body.posts[1].createdAt)
    );
  });

  it("should return 400 for invalid request parameters", async () => {
    const res = await supertest(app)
      .get(BASE_URL)
      .set("Authorization", `Bearer ${token}`)
      .query({ type: "ACTIVITIES" });

    const errors = JSON.parse(res.body.error);

    expect(res.status).to.equal(400);
    expect(errors[0].message).to.equal(
      "projectId is required for activities and decisions"
    );
  });

  it("should return 500 on server error", async () => {
    sinon.stub(PostFolder, "find").throws(new Error("Database failure"));

    const res = await supertest(app)
      .get(BASE_URL)
      .set("Authorization", `Bearer ${token}`)
      .query({ projectId: project._id.toString(), type: "ACTIVITIES" });

    console.log(res.body);
    console.log(res.status);
    console.log(res.body.error);

    expect(res.status).to.equal(500);
    expect(res.body.error).to.equal("Error fetching posts");
    PostFolder.find.restore();
  });
});
