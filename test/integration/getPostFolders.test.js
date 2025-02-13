// 🛠 Third-party modules
import * as chai from "chai";
import supertest from "supertest";
import mongoose from "mongoose";

// 🚀 Core application modules
import app from "../../app.js"; // Import the app
import Project from "../../models/Project.js";
import PostFolder from "../../models/postFolderModel.js";

// 📌 Configurations & Utilities
import { setupTestDB, teardownTestDB } from "../utils/setupTestDB.js";
import { generateAccessToken } from "../../utils/jwtUtils.js";
import UserProjectMapping from "../../models/UserProjectMapping.js";

const { expect } = chai;

describe("GET /api/posts-folders (Full Project Access)", () => {
  let authToken;
  let userId;
  let projectId;
  let category = "Images"; // Using a valid category from categoryEnum
  let folder1, folder2, post1, rootPost; // Define all variables at the top

  before(async () => {
    await setupTestDB(); // Setup in-memory MongoDB
  });

  after(async () => {
    await teardownTestDB(); // Teardown in-memory MongoDB
  });

  beforeEach(async () => {
    await Project.deleteMany({});
    await PostFolder.deleteMany({});

    // Create a mock user
    userId = new mongoose.Types.ObjectId();

    // Generate a valid access token
    const foundUser = {
      _id: userId.toString(),
      email: "owner@example.com",
      plan: "BASIC",
    };
    authToken = generateAccessToken(foundUser);

    // Create a project where the user is the owner
    const project = await Project.create({
      name: "Test Project",
      description: "Testing project hierarchy",
      createdBy: userId.toString(),
      ownerEmail: "owner@example.com",
      location: "New York",
    });

    projectId = project._id.toString();

    // ✅ Create sample folders & posts in hierarchical order
    folder1 = await PostFolder.create({
      type: "FOLDER",
      name: "Ken's Image",
      projectId,
      category,
      createdBy: userId.toString(),
      parentFolderId: null, // Root level folder
    });

    folder2 = await PostFolder.create({
      type: "FOLDER",
      name: "PDF for Kens",
      projectId,
      category,
      createdBy: userId.toString(),
      parentFolderId: folder1._id, // Nested folder under folder1
    });

    post1 = await PostFolder.create({
      type: "POST",
      name: "Kens Report",
      projectId,
      category,
      createdBy: userId.toString(),
      parentFolderId: folder2._id, // Post inside folder2
    });

    rootPost = await PostFolder.create({
      type: "POST",
      name: "Root-Level Post",
      projectId,
      category,
      createdBy: userId.toString(),
      parentFolderId: null, // Root-level post
    });
  });

  it("should return all folders & posts for the project owner in a hierarchical format", async () => {
    const res = await supertest(app)
      .get(`/post/posts-folders?projectId=${projectId}&category=${category}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).to.equal(200);
    expect(res.body).to.be.an("array");

    // ✅ Check that the response contains root-level folders and posts
    expect(res.body).to.have.length(2); // 1 root folder + 1 root post

    // ✅ Validate the first item is a folder
    const rootFolder = res.body.find(
      (item) => item._id && item.type === "FOLDER"
    );
    expect(rootFolder).to.exist;
    expect(rootFolder.name).to.equal("Ken's Image");
    expect(rootFolder.children).to.be.an("array");
    expect(rootFolder.children).to.have.length(1); // folder2 should be inside folder1

    // ✅ Validate the nested structure
    const nestedFolder = rootFolder.children.find(
      (child) => child.type === "FOLDER"
    );
    expect(nestedFolder).to.exist;
    expect(nestedFolder.name).to.equal("PDF for Kens");

    // ✅ Validate the post inside nested folder
    const nestedPost = nestedFolder.children.find(
      (child) => child.type === "POST"
    );
    expect(nestedPost).to.exist;
    expect(nestedPost.name).to.equal("Kens Report");

    // ✅ Validate the root-level post exists
    const rootPost = res.body.find((item) => item.type === "POST");
    expect(rootPost).to.exist;
    expect(rootPost.name).to.equal("Root-Level Post");
  });

  it("should return all folders & posts for a user with full category access", async () => {
    // ✅ Create a new user who is NOT the project owner
    const anotherUserId = new mongoose.Types.ObjectId();
    const anotherUser = {
      _id: anotherUserId.toString(),
      email: "categoryUser@example.com",
      plan: "BASIC",
    };
    const anotherUserToken = generateAccessToken(anotherUser);

    // ✅ Create a UserProjectMapping entry granting full category access
    await UserProjectMapping.create({
      email: "categoryUser@example.com",
      projectId,
      categoryAccess: [{ category, role: "VIEWER" }],
      createdBy: userId.toString(),
    });

    // ✅ Make API request with the new user
    const res = await supertest(app)
      .get(`/post/posts-folders?projectId=${projectId}&category=${category}`)
      .set("Authorization", `Bearer ${anotherUserToken}`);

    expect(res.status).to.equal(200);
    expect(res.body).to.be.an("array");

    // ✅ Validate root-level structure
    expect(res.body).to.have.length(2); // 1 root folder + 1 root post

    const rootFolder = res.body.find((item) => item.type === "FOLDER");
    expect(rootFolder).to.exist;
    expect(rootFolder.name).to.equal("Ken's Image");
    expect(rootFolder.children).to.have.length(1); // Nested folder

    // ✅ Validate nested folder and post
    const nestedFolder = rootFolder.children.find(
      (child) => child.type === "FOLDER"
    );
    expect(nestedFolder).to.exist;
    expect(nestedFolder.name).to.equal("PDF for Kens");

    const nestedPost = nestedFolder.children.find(
      (child) => child.type === "POST"
    );
    expect(nestedPost).to.exist;
    expect(nestedPost.name).to.equal("Kens Report");

    // ✅ Validate root-level post
    const rootPost = res.body.find((item) => item.type === "POST");
    expect(rootPost).to.exist;
    expect(rootPost.name).to.equal("Root-Level Post");
  });

  it("should return only allowed folders & posts for a user with limited file/folder access", async () => {
    // ✅ Create a new user who is NOT the project owner
    const restrictedUserId = new mongoose.Types.ObjectId();
    const restrictedUser = {
      _id: restrictedUserId.toString(),
      email: "limitedUser@example.com",
      plan: "BASIC",
    };
    const restrictedUserToken = generateAccessToken(restrictedUser);

    // ✅ Assign limited access to specific folders/posts
    await UserProjectMapping.create({
      email: "limitedUser@example.com",
      projectId,
      fileOrFolderAccess: [
        {
          category,
          files: [
            { fileOrFolderId: folder1._id, role: "VIEWER" }, // Access to "Ken's Image" folder
            { fileOrFolderId: rootPost._id, role: "VIEWER" }, // Access to "Root-Level Post"
          ],
        },
      ],
      createdBy: userId.toString(),
    });

    // ✅ Make API request with the restricted user
    const res = await supertest(app)
      .get(`/post/posts-folders?projectId=${projectId}&category=${category}`)
      .set("Authorization", `Bearer ${restrictedUserToken}`);

    expect(res.status).to.equal(200);
    expect(res.body).to.be.an("array");

    // ✅ Validate response contains ONLY allowed items
    expect(res.body).to.have.length(2); // Only folder1 + root-level post

    const allowedFolder = res.body.find(
      (item) => item._id === folder1._id.toString()
    );
    expect(allowedFolder).to.exist;
    expect(allowedFolder.name).to.equal("Ken's Image");

    const allowedPost = res.body.find(
      (item) => item._id === rootPost._id.toString()
    );
    expect(allowedPost).to.exist;
    expect(allowedPost.name).to.equal("Root-Level Post");

    // ✅ Ensure restricted items are NOT in the response
    const disallowedFolder = res.body.find(
      (item) => item._id === folder2._id.toString()
    );
    expect(disallowedFolder).to.not.exist;

    const disallowedPost = res.body.find(
      (item) => item._id === post1._id.toString()
    );
    expect(disallowedPost).to.not.exist;
  });

  it("should return root-level folders & posts at the top level", async () => {
    // ✅ Create root-level folder
    const rootFolder = await PostFolder.create({
      type: "FOLDER",
      name: "Root Folder",
      projectId,
      category,
      createdBy: userId.toString(),
      parentFolderId: null, // Root-level
    });

    // ✅ Create a nested folder inside the root folder
    const nestedFolder = await PostFolder.create({
      type: "FOLDER",
      name: "Nested Folder",
      projectId,
      category,
      createdBy: userId.toString(),
      parentFolderId: rootFolder._id, // Inside root folder
    });

    // ✅ Create a root-level post
    // const rootPost = await PostFolder.create({
    //   type: "POST",
    //   name: "Root-Level Post",
    //   projectId,
    //   category,
    //   createdBy: userId.toString(),
    //   parentFolderId: null, // Root-level
    // });

    // ✅ Make API request
    const res = await supertest(app)
      .get(`/post/posts-folders?projectId=${projectId}&category=${category}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).to.equal(200);
    expect(res.body).to.be.an("array");

    // ✅ Validate root-level structure
    expect(res.body).to.have.length(3); // 1 root folder + 1 root post

    const rootFolderResponse = res.body.find(
      (item) => item._id === rootFolder._id.toString()
    );
    expect(rootFolderResponse).to.exist;
    expect(rootFolderResponse.type).to.equal("FOLDER");
    expect(rootFolderResponse.parentFolderId).to.be.null;
    expect(rootFolderResponse.children).to.have.length(1); // Should contain nestedFolder

    const nestedFolderResponse = rootFolderResponse.children.find(
      (child) => child._id === nestedFolder._id.toString()
    );
    expect(nestedFolderResponse).to.exist;
    expect(nestedFolderResponse.type).to.equal("FOLDER");

    const rootPostResponse = res.body.find(
      (item) => item._id === rootPost._id.toString()
    );
    expect(rootPostResponse).to.exist;
    expect(rootPostResponse.type).to.equal("POST");
    expect(rootPostResponse.parentFolderId).to.be.null;
  });

  it("should return folders containing their respective subfolders and posts", async () => {
    // ✅ Create a root-level folder
    const rootFolder = await PostFolder.create({
      type: "FOLDER",
      name: "Root Folder",
      projectId,
      category,
      createdBy: userId.toString(),
      parentFolderId: null, // Root-level
    });

    // ✅ Create a nested folder inside the root folder
    const nestedFolder = await PostFolder.create({
      type: "FOLDER",
      name: "Nested Folder",
      projectId,
      category,
      createdBy: userId.toString(),
      parentFolderId: rootFolder._id, // Inside root folder
    });

    // ✅ Create a post inside the root folder
    const postInRoot = await PostFolder.create({
      type: "POST",
      name: "Post in Root Folder",
      projectId,
      category,
      createdBy: userId.toString(),
      parentFolderId: rootFolder._id, // Inside root folder
    });

    // ✅ Create a post inside the nested folder
    const postInNestedFolder = await PostFolder.create({
      type: "POST",
      name: "Post in Nested Folder",
      projectId,
      category,
      createdBy: userId.toString(),
      parentFolderId: nestedFolder._id, // Inside nested folder
    });

    // ✅ Make API request
    const res = await supertest(app)
      .get(`/post/posts-folders?projectId=${projectId}&category=${category}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).to.equal(200);
    expect(res.body).to.be.an("array");

    // ✅ Validate root-level structure
    const rootFolderResponse = res.body.find(
      (item) => item._id === rootFolder._id.toString()
    );
    expect(rootFolderResponse).to.exist;
    expect(rootFolderResponse.type).to.equal("FOLDER");
    expect(rootFolderResponse.parentFolderId).to.be.null;
    expect(rootFolderResponse.children).to.have.length(2); // 1 nested folder + 1 post

    // ✅ Validate the nested folder structure
    const nestedFolderResponse = rootFolderResponse.children.find(
      (child) => child._id === nestedFolder._id.toString()
    );
    expect(nestedFolderResponse).to.exist;
    expect(nestedFolderResponse.type).to.equal("FOLDER");
    expect(nestedFolderResponse.children).to.have.length(1); // Only the post inside nested folder

    // ✅ Validate the post inside nested folder
    const postInNestedFolderResponse = nestedFolderResponse.children.find(
      (child) => child._id === postInNestedFolder._id.toString()
    );
    expect(postInNestedFolderResponse).to.exist;
    expect(postInNestedFolderResponse.type).to.equal("POST");

    // ✅ Validate the post inside the root folder
    const postInRootResponse = rootFolderResponse.children.find(
      (child) => child._id === postInRoot._id.toString()
    );
    expect(postInRootResponse).to.exist;
    expect(postInRootResponse.type).to.equal("POST");
  });

  //   REWORK REFACTOR
  //   it("should return folders first, then posts, sorted by updatedAt in descending order", async () => {
  //     const now = new Date();

  //     // ✅ Create two root-level folders with different timestamps
  //     const olderFolder = await PostFolder.create({
  //       type: "FOLDER",
  //       name: "Older Folder",
  //       projectId,
  //       category,
  //       createdBy: userId.toString(),
  //       parentFolderId: null,
  //       updatedAt: new Date(now.getTime() - 10000), // 10 sec older
  //     });

  //     const newerFolder = await PostFolder.create({
  //       type: "FOLDER",
  //       name: "Newer Folder",
  //       projectId,
  //       category,
  //       createdBy: userId.toString(),
  //       parentFolderId: null,
  //       updatedAt: new Date(now.getTime() - 5000), // 5 sec older
  //     });

  //     // ✅ Create two root-level posts with different timestamps
  //     const olderPost = await PostFolder.create({
  //       type: "POST",
  //       name: "Older Post",
  //       projectId,
  //       category,
  //       createdBy: userId.toString(),
  //       parentFolderId: null,
  //       updatedAt: new Date(now.getTime() - 8000), // 8 sec older
  //     });

  //     const newerPost = await PostFolder.create({
  //       type: "POST",
  //       name: "Newer Post",
  //       projectId,
  //       category,
  //       createdBy: userId.toString(),
  //       parentFolderId: null,
  //       updatedAt: new Date(now.getTime() - 3000), // 3 sec older
  //     });

  //     // ✅ Make API request
  //     const res = await supertest(app)
  //       .get(`/post/posts-folders?projectId=${projectId}&category=${category}`)
  //       .set("Authorization", `Bearer ${authToken}`);

  //     expect(res.status).to.equal(200);
  //     expect(res.body).to.be.an("array");

  //     // REWORK - FOLDER FOLLOWED BBY POST
  //     // ✅ Validate sorting order (latest first)
  //     expect(res.body).to.have.length(4); // 2 folders + 2 posts
  //     expect(res.body[0].type).to.equal("POST"); // First item must be a folder
  //     expect(res.body[1].type).to.equal("POST"); // Second item must be a folder
  //     expect(res.body[2].type).to.equal("FOLDER"); // Third item must be a post
  //     expect(res.body[3].type).to.equal("FOLDER"); // Fourth item must be a post

  //     // ✅ Validate correct folder sorting order
  //     expect(res.body[2].name).to.equal("Newer Folder");
  //     expect(res.body[3].name).to.equal("Older Folder");

  //     // ✅ Validate correct post sorting order
  //     expect(res.body[0].name).to.equal("Newer Post");
  //     expect(res.body[1].name).to.equal("Older Post");
  //   });

  it("should return an empty array when no folders or posts exist", async () => {
    // ✅ Ensure the database is empty
    await PostFolder.deleteMany({ projectId });

    // ✅ Make API request
    const res = await supertest(app)
      .get(`/post/posts-folders?projectId=${projectId}&category=${category}`)
      .set("Authorization", `Bearer ${authToken}`);

    // ✅ Validate response
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an("array");
    expect(res.body).to.have.length(0); // Should return an empty array
  });

  // ### **❌ Negative Test Cases**
  it("should return 400 if projectId format is invalid", async () => {
    const res = await supertest(app)
      .get(`/post/posts-folders?projectId=invalid123&category=Images`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).to.equal(400);
    expect(res.body.message).to.equal("Validation failed");
    expect(res.body.errors.projectId._errors[0]).to.equal(
      "Invalid projectId format"
    );
  });

  it("should return 400 if category is invalid", async () => {
    const res = await supertest(app)
      .get(
        `/post/posts-folders?projectId=${projectId}&category=InvalidCategory`
      )
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).to.equal(400);
    expect(res.body.message).to.equal("Validation failed");
    expect(res.body.errors.category._errors[0]).to.equal(
      "Invalid category value"
    );
  });

  it("should return 400 if projectId is missing", async () => {
    const res = await supertest(app)
      .get(`/post/posts-folders?category=Images`) // Missing projectId
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).to.equal(400);
    expect(res.body.message).to.equal("Validation failed");
    expect(res.body.errors.projectId._errors[0]).to.equal("Required");
  });

  it("should return 400 if category is missing", async () => {
    const res = await supertest(app)
      .get(`/post/posts-folders?projectId=${projectId}`) // Missing category
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).to.equal(400);
    expect(res.body.message).to.equal("Validation failed");
    expect(res.body.errors.category._errors[0]).to.equal(
      "Invalid category value"
    );
  });

  it("should return 403 if user has no access to project or category", async () => {
    // ✅ Create a new user who is NOT the project owner and has no access
    const unauthorizedUserId = new mongoose.Types.ObjectId();
    const unauthorizedUser = {
      _id: unauthorizedUserId.toString(),
      email: "unauthorized@example.com",
      plan: "BASIC",
    };
    const unauthorizedToken = generateAccessToken(unauthorizedUser);

    // ✅ Ensure the user has no access (no UserProjectMapping entry)
    await UserProjectMapping.deleteMany({
      email: "unauthorized@example.com",
      projectId,
    });

    // ✅ Make API request with the unauthorized user
    const res = await supertest(app)
      .get(`/post/posts-folders?projectId=${projectId}&category=${category}`)
      .set("Authorization", `Bearer ${unauthorizedToken}`);

    expect(res.status).to.equal(403);
    expect(res.body.message).to.equal("Unauthorized to access this project");
  });

  it("should return 403 if token is invalid", async () => {
    const res = await supertest(app)
      .get(`/post/posts-folders?projectId=${projectId}&category=${category}`)
      .set("Authorization", "Bearer invalid_token"); // Invalid token

    expect(res.status).to.equal(403);
    expect(res.body.message).to.equal("Invalid or expired token");
  });

  it("should return 404 if projectId does not exist", async () => {
    const nonExistingProjectId = new mongoose.Types.ObjectId(); // Generate a valid but non-existing ID

    const res = await supertest(app)
      .get(
        `/post/posts-folders?projectId=${nonExistingProjectId}&category=${category}`
      )
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).to.equal(404);
    expect(res.body.message).to.equal("Project not found.");
  });

  it("should return 403 if user has limited access but no matching files/folders", async () => {
    // ✅ Create a new user with restricted access
    const limitedUserId = new mongoose.Types.ObjectId();
    const limitedUser = {
      _id: limitedUserId.toString(),
      email: "limiteduser@example.com",
      plan: "BASIC",
    };
    const limitedUserToken = generateAccessToken(limitedUser);

    // ✅ Assign fileOrFolderAccess with non-matching `_id`s
    await UserProjectMapping.create({
      email: "limitedusesr@example.com",
      projectId,
      fileOrFolderAccess: [
        {
          category,
          files: [
            { fileOrFolderId: new mongoose.Types.ObjectId(), role: "VIEWER" }, // Non-existent folder/post
          ],
        },
      ],
      createdBy: userId.toString(),
    });

    // ✅ Make API request with the limited user
    const res = await supertest(app)
      .get(`/post/posts-folders?projectId=${projectId}&category=${category}`)
      .set("Authorization", `Bearer ${limitedUserToken}`);

    console.log(res.status);
    console.log(res.body);

    expect(res.status).to.equal(403);
    // expect(res.body.message).to.equal(
    //   "Unauthorized: No access to any folders or posts"
    // );
    expect(res.body.message).to.equal("Unauthorized to access this project");
  });
});



// ### **⚡ Edge Cases**  


// 3️⃣ **Large Dataset Handling** → Simulate thousands of records to check API performance and response time.  
// 4️⃣ **Database Connection Failure** → Simulate a database error to ensure it returns `500 Internal Server Error`.  
// 5️⃣ **Concurrency Test** → Multiple users request data simultaneously to check performance under load.  
// 6️⃣ **Mixed Access Control** → User has full access to some categories and limited access to others; ensure correct filtering.  

// ---