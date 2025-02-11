import UserProjectMapping from "../models/UserProjectMapping.js";
import Project from "../models/Project.js";

/**
 * Checks if a user has permission to update a post or file in a project.
 * @param {String} userId - The ID of the authenticated user.
 * @param {String} email - The ID of the authenticated user.
 * @param {String} projectId - The project ID associated with the post.
 * @param {String} category - The category being updated.
 * @param {Array} fileIds - The list of file or folder IDs being updated.
 * @returns {Boolean} - True if the user has permission, false otherwise.
 */
export const isUserAuthorized = async (
  userId,
  email,
  projectId,
  category,
  fileIds,
  checkAll = false // Determines if full validation is required
) => {
  try {
    // Step 1: Check if the user is the project creator
    const project = await Project.findOne({
      _id: projectId,
      createdBy: userId,
    });
    // console.log("project", project);
    if (project) return true; // ✅ User is project creator

    // Step 2: Check project-level access in UserProjectMapping
    const userMapping = await UserProjectMapping.findOne({ email, projectId });
    console.log("userMapping", userMapping);
    console.log("email", email);
    console.log("projectId", projectId);

    if (!userMapping) return false; // ❌ No project access

    // Check if user has full project-level access (ADMIN or EDITOR)
    if (["ADMIN", "EDITOR"].includes(userMapping.role)) return true;

    // If checkAll is false, return early
    if (!checkAll) return false; // ❌ No full validation needed

    // Step 3: Check category-level access
    const hasCategoryAccess = userMapping.categoryAccess.some(
      (c) => c.category === category && c.role === "EDITOR"
    );
    if (hasCategoryAccess) return true; // ✅ User has category edit access

    // Step 4: Check file/folder-level access
    const hasFileAccess = userMapping.fileOrFolderAccess.some((access) =>
      access.files.some(
        (file) =>
          fileIds.includes(file.fileOrFolderId.toString()) &&
          file.role === "EDITOR"
      )
    );

    return hasFileAccess; // ✅ User has file-level edit access
  } catch (error) {
    console.error("Authorization error:", error);
    return false;
  }
};
