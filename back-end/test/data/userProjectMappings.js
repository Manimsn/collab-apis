// import mongoose from "mongoose";
// import UserProjectMapping from "../../models/UserProjectMapping.js"; // Import UserProjectMapping model
// import { users } from "./users.js"; // Import predefined users
// import { projects } from "./projects.js"; // Import predefined projects

// // ✅ Predefined access mappings
// export const userProjectMappings = {
//   manishGrantsAdminToAnu: {
//     _id: new mongoose.Types.ObjectId(),
//     email: users.anuUser.email, // ✅ Anu receives ADMIN access
//     projectId: projects.manishSharedProject._id, // ✅ Access to Manish's shared project
//     createdBy: users.manishUser._id, // ✅ Granted by Manish (project owner)
//     status: "accepted",
//     role: "ADMIN", // ✅ Full access
//   },
//   anuGrantsViewerToEditor: {
//     _id: new mongoose.Types.ObjectId(),
//     email: users.editorUser.email, // ✅ Editor gets VIEWER access
//     projectId: projects.anuOwnedProject._id, // ✅ Access to Anu's private project
//     createdBy: users.anuUser._id, // ✅ Granted by Anu (project owner)
//     status: "accepted",
//     role: "VIEWER", // ✅ Read-only access
//   },
//   editorGrantsEditorToViewer: {
//     _id: new mongoose.Types.ObjectId(),
//     email: users.viewerUser.email, // ✅ Viewer gets EDITOR access
//     projectId: projects.editorOwnedProject._id, // ✅ Access to Editor's project
//     createdBy: users.editorUser._id, // ✅ Granted by Editor (project owner)
//     status: "accepted",
//     role: "EDITOR", // ✅ Can edit content
//   },
//   manishGrantsCategoryAccess: {
//     _id: new mongoose.Types.ObjectId(),
//     email: users.viewerUser.email, // ✅ Viewer gets category-level access
//     projectId: projects.publicProject._id, // ✅ Access to public project
//     createdBy: users.manishUser._id, // ✅ Granted by Manish (owner)
//     status: "accepted",
//     categoryAccess: [
//       { category: "Images", role: "VIEWER" }, // ✅ Read-only access to Images category
//     ],
//   },
//   anuGrantsFileAccessToAdmin: {
//     _id: new mongoose.Types.ObjectId(),
//     email: users.adminUser.email, // ✅ Admin gets file-level access
//     projectId: projects.anuOwnedProject._id, // ✅ Access to Anu's private project
//     createdBy: users.anuUser._id, // ✅ Granted by Anu (owner)
//     status: "accepted",
//     fileOrFolderAccess: [
//       {
//         category: "Documents",
//         files: [
//           { fileOrFolderId: new mongoose.Types.ObjectId(), role: "EDITOR" }, // ✅ Edit access to specific file
//         ],
//       },
//     ],
//   },
// };

// // ✅ Function to insert sample user-project mappings into the test database
// export const insertUserProjectMappings = async () => {
//   await UserProjectMapping.insertMany(Object.values(userProjectMappings));
// };

// // ✅ Function to delete all user-project mappings from the test database
// export const deleteUserProjectMappings = async () => {
//   await UserProjectMapping.deleteMany({});
// };
