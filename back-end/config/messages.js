export const messages = {
  PROJECT: {
    NOT_FOUND: "Project not found.",
    INVITE_OWNER_ERROR: "Cannot invite the project owner to their own project.",
    INVITE_PERMISSION_ERROR: "Only the project owner can invite members.",
    MAX_PROJECTS_REACHED: (plan, max) =>
      `Your plan (${plan}) allows only ${max} projects.`,
    MAX_MEMBERS_REACHED: (plan, max) =>
      `Your plan (${plan}) allows only ${max} members per project.`,
    MAX_CATEGORY_MEMBERS_REACHED: (plan, max) =>
      `Your plan (${plan}) allows only ${max} category-level members per project.`,
  },
  INVITE: {
    ALREADY_MEMBER: "User is already a project member.",
    SENT_SUCCESS: "Invitation sent successfully!",
    INVALID_OR_EXPIRED: "Invalid or expired invite.",
    UNAUTHORIZED: "You can't use someone else's invite.",
    EXPIRED: "This invite has expired.",
    SUCCESSFULLY_JOINED: "You have successfully joined the project!",
    REVOKED_SUCCESS: "Invitation revoked successfully.",
    NOT_FOUND_OR_USED: "Invite not found or already used.",
    CATEGORY_ALREADY_HAS_ACCESS: "User already has access to this category.",
    INVALID_EMAIL_FORMAT: "Invalid email format.",
    FILE_OR_FOLDER_REQUIRED: "File or Folder ID is required.",
    CATEGORY_REQUIRED_FOR_FILE_OR_FOLDER:
      "Category is required when assigning file or folder access.",
    ADMIN_NOT_ALLOWED: (level) =>
      `ADMIN role is not allowed for ${level}-level access.`,
    SOME_FILES_OR_FOLDERS_GRANTED_ACCESS: (alreadyAccessible, newlyAdded) =>
      `${alreadyAccessible} already had access, ${newlyAdded} were given access.`,
    ALREADY_HAS_FILE_OR_FOLDER_ACCESS: (alreadyExistsCount) =>
      `${alreadyExistsCount} Files already had access`,
  },
  AUTH: {
    UNAUTHORIZED: "Unauthorized: No email found in token.",
    FORBIDDEN: "You do not have permission to perform this action.",
  },
};
