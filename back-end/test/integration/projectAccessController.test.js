// 🛠 Third-party modules
import * as chai from "chai";
import supertest from "supertest";
import mongoose from "mongoose";
import sinon from "sinon";

// 🚀 Core application modules
import app from "../../app.js"; // Import Express app
import Project from "../../models/Project.js";
import UserProjectMapping from "../../models/UserProjectMapping.js";

// 📌 Configurations & Utilities
import { setupTestDB, teardownTestDB } from "../utils/setupTestDB.js";
import { generateAccessToken } from "../../utils/jwtUtils.js";
import { createUser } from "../testData/userTestData.js";
import { createProject } from "../testData/projectTestData.js";
import { createUserProjectMapping } from "../testData/userProjectMappingTestData.js";
import { categories } from "../../config/constants.js";

const { expect } = chai;

const BASE_URL = `/projects/categorylist/`;

describe("GET /projects/categorylist/ (Fetching User Allowed Categories)", () => {
  let authToken;
  let user, owner, project, sharedProject;

  before(async () => {
    await setupTestDB(); // Setup in-memory MongoDB
  });

  after(async () => {
    await teardownTestDB(); // Teardown in-memory MongoDB
  });

  beforeEach(async () => {
    user = await createUser();
    owner = await createUser();

    project = await createProject(owner._id, owner.email);

    sharedProject = await createProject(owner._id, owner.email);

    authToken = generateAccessToken({
      _id: user._id,
      email: user.email,
    });
  });

  // ✅ **1. Project Owner Should Get Full Access**
  it("should return ALL categories for project owner", async () => {
    const res = await supertest(app)
      .get(`${BASE_URL}${project._id}`)
      .set(
        "Authorization",
        `Bearer ${generateAccessToken({ _id: owner._id, email: owner.email })}`
      );

    expect(res.status).to.equal(200);
    expect(res.body).to.deep.equal({ allowedCategories: "ALL" });
  });

  // ✅ **2. User With Role in `UserProjectMapping` Should Get Full Access**
  it("should return ALL categories for users with role in UserProjectMapping", async () => {
    await createUserProjectMapping(
      user.email,
      sharedProject._id,
      owner._id,
      "ADMIN"
    );

    const res = await supertest(app)
      .get(`${BASE_URL}${sharedProject._id}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).to.equal(200);
    expect(res.body).to.deep.equal({ allowedCategories: "ALL" });
  });

  // ✅ **3. User With Category-Level Access**
  it("should return only category-level access", async () => {
    await createUserProjectMapping(
      user.email,
      sharedProject._id,
      owner._id,
      null,
      "invited",
      [
        { category: categories.IMAGES, role: "VIEWER" },
        { category: categories.PANORAMA, role: "EDITOR" },
      ]
    );

    const res = await supertest(app)
      .get(`${BASE_URL}${sharedProject._id}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).to.equal(200);
    expect(res.body).to.deep.equal({
      allowedCategories: [categories.IMAGES, categories.PANORAMA],
    });
  });

  //   // ✅ **4. User With File/Folder-Level Access**
  it("should return only file/folder-level access", async () => {
    await createUserProjectMapping(
      user.email,
      sharedProject._id,
      owner._id,
      null,
      "invited",
      [],
      [
        {
          category: categories.MOODBAORD,
          files: [
            { fileOrFolderId: new mongoose.Types.ObjectId(), role: "VIEWER" },
          ],
        },
      ]
    );

    const res = await supertest(app)
      .get(`${BASE_URL}${sharedProject._id}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).to.equal(200);
    expect(res.body).to.deep.equal({
      allowedCategories: [categories.MOODBAORD],
    });
  });

  //   // ✅ **5. User With Both Category & File Access**
  it("should return merged access from category and file/folder", async () => {
    await createUserProjectMapping(
      user.email,
      sharedProject._id,
      owner._id,
      null,
      "invited",
      [{ category: categories.IMAGES, role: "VIEWER" }],
      [
        {
          category: categories.PANORAMA,
          files: [
            { fileOrFolderId: new mongoose.Types.ObjectId(), role: "VIEWER" },
          ],
        },
      ]
    );

    const res = await supertest(app)
      .get(`${BASE_URL}${sharedProject._id}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).to.equal(200);
    expect(res.body).to.deep.equal({
      allowedCategories: [categories.IMAGES, categories.PANORAMA],
    });
  });

  //   // ❌ **6. User With No Access**
  it("should return 403 if user has no access", async () => {
    const res = await supertest(app)
      .get(`${BASE_URL}${sharedProject._id}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).to.equal(403);
    expect(res.body).to.have.property("message", "No access to this project.");
  });

  //   // ❌ **7. Invalid Project ID Format**
  it("should return 400 for invalid projectId format", async () => {
    const res = await supertest(app)
      .get(`${BASE_URL}invalidProjectId`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).to.equal(400);
    expect(res.body).to.have.property(
      "message",
      "Invalid projectId. Must be a valid MongoDB ObjectId."
    );
  });

  //   // ❌ **8. Unauthorized (Missing Token)**
  it("should return 401 if authorization token is missing", async () => {
    const res = await supertest(app).get(`${BASE_URL}${project._id}`);

    expect(res.status).to.equal(401);
    expect(res.body).to.have.property(
      "message",
      "Access token missing or invalid"
    );
  });

  //   // ❌ **9. Invalid Token**
  it("should return 403 if token is invalid", async () => {
    const res = await supertest(app)
      .get(`${BASE_URL}${project._id}`)
      .set("Authorization", `Bearer invalid_token`);

    expect(res.status).to.equal(403);
    expect(res.body).to.have.property("message", "Invalid or expired token");
  });

  //   // ❌ **10. Simulated Database Error**
  it("should return 500 if database error occurs", async () => {
    sinon.stub(Project, "findOne").throws(new Error("Database failure"));

    const res = await supertest(app)
      .get(`${BASE_URL}${project._id}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).to.equal(500);
    expect(res.body).to.have.property("message", "Internal Server Error");

    // Restore behavior
    Project.findOne.restore();
  });
});
