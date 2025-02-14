import { faker } from "@faker-js/faker";
import UserProjectMapping from "../../models/UserProjectMapping.js";

/**
 * Generate user-project mapping data
 * @param {Object} overrides - Custom field values to override defaults
 * @param {String} userEmail - Email of the user
 * @param {ObjectId} projectId - Project ID to associate the user with
 * @param {ObjectId} createdBy - ID of the user who created the mapping
 * @param {String} [role] - User role (ADMIN, VIEWER, EDITOR, COMMENTER) - Optional
 * @param {String} [status="invited"] - Invitation status (default: "invited")
 * @param {Array} [categoryAccess=[]] - Category-level access details (optional)
 * @param {Array} [fileOrFolderAccess=[]] - File/Folder-level access details (optional)
 * @returns {Object} Generated user-project mapping data
 */
export const generateUserProjectMapping = (
  overrides = {},
  userEmail,
  projectId,
  createdBy,
  role, // Now optional, only assigned if explicitly provided
  status = "invited",
  categoryAccess = [],
  fileOrFolderAccess = []
) => {
  return {
    email: userEmail,
    projectId,
    ...(role ? { role } : {}), // Assign role only if explicitly passed
    categoryAccess,
    fileOrFolderAccess,
    status,
    inviteToken: faker.string.uuid(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Expires in 24 hours
    createdBy,
    ...overrides, // Ensures custom overrides are applied
  };
};

/**
 * Create and insert a user-project mapping into MongoDB
 * @param {Object} overrides - Custom field values to override defaults
 * @param {String} userEmail - Email of the user
 * @param {ObjectId} projectId - Project ID to associate the user with
 * @param {ObjectId} createdBy - ID of the user who created the mapping
 * @param {String} [role] - User role (ADMIN, VIEWER, EDITOR, COMMENTER) - Optional
 * @param {String} [status="invited"] - Invitation status (default: "invited")
 * @param {Array} [categoryAccess=[]] - Category-level access details (optional)
 * @param {Array} [fileOrFolderAccess=[]] - File/Folder-level access details (optional)
 * @returns {Object} MongoDB document for user-project mapping
 */
export const createUserProjectMapping = async (
  overrides = {},
  userEmail,
  projectId,
  createdBy,
  role, // Now optional
  status = "invited",
  categoryAccess = [],
  fileOrFolderAccess = []
) => {
  const mappingData = generateUserProjectMapping(
    overrides,
    userEmail,
    projectId,
    createdBy,
    role,
    status,
    categoryAccess,
    fileOrFolderAccess
  );
  return await UserProjectMapping.create(mappingData);
};
