// import * as chai from "chai";
// import supertest from "supertest";
// import mongoose from "mongoose";
// import app from "../../app.js"; // Import the Express app
// import Post from "../../models/postModel.js";
// import FileFolder from "../../models/fileFolderModel.js";
// import { setupTestDB, teardownTestDB } from "../utils/setupTestDB.js";
// import { generateAccessToken } from "../../utils/jwtUtils.js";

// const { expect } = chai;

// describe("POST /post", () => {
//   let authToken;
//   let userId;
//   let projectId;
//   let parentFolderId;

//   before(async () => {
//     await setupTestDB(); // Setup in-memory MongoDB
//   });

//   after(async () => {
//     await teardownTestDB(); // Teardown in-memory MongoDB
//   });

//   beforeEach(async () => {
//     await Post.deleteMany({});
//     await FileFolder.deleteMany({});

//     // Create mock user & project data
//     userId = new mongoose.Types.ObjectId();
//     projectId = new mongoose.Types.ObjectId();
//     parentFolderId = new mongoose.Types.ObjectId(); // Simulate a folder ID

//     // Generate an access token
//     const userPayload = { _id: userId.toString(), email: "user@example.com" };
//     authToken = generateAccessToken(userPayload);
//   });

//   // ✅ **Successful Test Case**
//   it("should successfully create a new post and associated file records", async () => {
//     const res = await supertest(app)
//       .post("/post")
//       .set("Authorization", `Bearer ${authToken}`)
//       .send({
//         parentFolderId: parentFolderId.toString(),
//         projectId: projectId.toString(),
//         category: "Drawings",
//         files: [
//           {
//             type: "file",
//             name: "Design Blueprint.pdf",
//             fileType: "pdf",
//           },
//           {
//             type: "file",
//             name: "Site Plan.jpg",
//             fileType: "image/jpeg",
//           },
//         ],
//       });

//     expect(res.status).to.equal(201);
//     expect(res.body.message).to.equal("Files/Folders created successfully");
//     expect(res.body.postId).to.be.a("string");
//     expect(res.body.files).to.be.an("array").that.has.lengthOf(2);
//   });

//   // ❌ **Validation Error: Missing required fields**
//   it("should return 400 if parentFolderId is missing", async () => {
//     const res = await supertest(app)
//       .post("/post")
//       .set("Authorization", `Bearer ${authToken}`)
//       .send({
//         projectId: projectId.toString(),
//         category: "Drawings",
//         files: [
//           {
//             type: "file",
//             name: "Design Blueprint.pdf",
//             fileType: "pdf",
//           },
//         ],
//       });

//     expect(res.status).to.equal(400);
//     expect(res.body.message).to.equal("Validation failed");
//     expect(res.body.errors.parentFolderId._errors).to.include("Required");
//   });

//   //   ❌ **Validation Error: Invalid projectId format**
//   it("should return 400 if projectId is invalid", async () => {
//     const res = await supertest(app)
//       .post("/post")
//       .set("Authorization", `Bearer ${authToken}`)
//       .send({
//         parentFolderId: parentFolderId.toString(),
//         projectId: "invalidProjectId",
//         category: "Drawings",
//         files: [
//           {
//             type: "file",
//             name: "Design Blueprint.pdf",
//             fileType: "pdf",
//           },
//         ],
//       });

//     expect(res.status).to.equal(400);
//     expect(res.body.message).to.equal("Validation failed");
//     expect(res.body.errors.projectId._errors).to.include(
//       "Invalid ObjectId format"
//     );
//   });

//   // ❌ **Validation Error: Invalid category**
//   it("should return 400 if category is not in allowed enums", async () => {
//     const res = await supertest(app)
//       .post("/post")
//       .set("Authorization", `Bearer ${authToken}`)
//       .send({
//         parentFolderId: parentFolderId.toString(),
//         projectId: projectId.toString(),
//         category: "InvalidCategory",
//         files: [
//           {
//             type: "file",
//             name: "Design Blueprint.pdf",
//             fileType: "pdf",
//           },
//         ],
//       });

//     expect(res.status).to.equal(400);
//     expect(res.body.message).to.equal("Validation failed");
//     expect(res.body.errors.category._errors).to.include(
//       "Invalid enum value. Expected 'Drawings' | 'Images' | 'Panoramas' | 'Renderings' | 'SideBySide' | 'Videos' | 'Specification' | 'MoodBoard' | '3DModels' | 'Survey' | 'Files', received 'InvalidCategory'"
//     );
//   });

//   // // ❌ **Validation Error: fileType missing for file type**
//   it("should return 400 if fileType is missing for type 'file'", async () => {
//     const res = await supertest(app)
//       .post("/post")
//       .set("Authorization", `Bearer ${authToken}`)
//       .send({
//         parentFolderId: parentFolderId.toString(),
//         projectId: projectId.toString(),
//         category: "Drawings",
//         files: [
//           {
//             type: "file",
//             name: "Design Blueprint.pdf",
//           },
//         ],
//       });

//     expect(res.status).to.equal(400);
//     expect(res.body.message).to.equal("Validation failed");
//     expect(res.body.errors.files[0].fileType._errors).to.include(
//       "fileType is required when type is 'file'"
//     );
//   });

//   // // ❌ **Unauthorized: No token provided**
//   it("should return 401 if no access token is provided", async () => {
//     const res = await supertest(app)
//       .post("/post")
//       .send({
//         parentFolderId: parentFolderId.toString(),
//         projectId: projectId.toString(),
//         category: "Drawings",
//         files: [
//           {
//             type: "file",
//             name: "Design Blueprint.pdf",
//             fileType: "pdf",
//           },
//         ],
//       });

//     expect(res.status).to.equal(401);
//     expect(res.body.message).to.equal("Access token missing or invalid");
//   });

//   // ❌ **Unauthorized: Invalid token provided**
//   it("should return 403 if an invalid token is provided", async () => {
//     const res = await supertest(app)
//       .post("/post")
//       .set("Authorization", "Bearer invalid.token.here")
//       .send({
//         parentFolderId: parentFolderId.toString(),
//         projectId: projectId.toString(),
//         category: "Drawings",
//         files: [
//           {
//             type: "file",
//             name: "Design Blueprint.pdf",
//             fileType: "pdf",
//           },
//         ],
//       });

//     expect(res.status).to.equal(403);
//     expect(res.body.message).to.equal("Invalid or expired token");
//   });

//   // ❌ **Unauthorized: Expired token**
//   it("should return 403 if an expired token is used", async () => {
//     const expiredToken = generateAccessToken(
//       { _id: userId.toString(), email: "user@example.com" },
//       "1ms"
//     );

//     const res = await supertest(app)
//       .post("/post")
//       .set("Authorization", `Bearer ${expiredToken}`)
//       .send({
//         parentFolderId: parentFolderId.toString(),
//         projectId: projectId.toString(),
//         category: "Drawings",
//         files: [
//           {
//             type: "file",
//             name: "Design Blueprint.pdf",
//             fileType: "pdf",
//           },
//         ],
//       });

//     expect(res.status).to.equal(403);
//     expect(res.body.message).to.equal("Invalid or expired token");
//   });
// });
