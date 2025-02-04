export const messages = {
  PROJECT: {
    NOT_FOUND: "Project not found.",
    INVITE_OWNER_ERROR: "Cannot invite the project owner to their own project.",
    INVITE_PERMISSION_ERROR: "Only the project owner can invite members.",
    MAX_PROJECTS_REACHED: (plan, max) =>
      `Your plan (${plan}) allows only ${max} projects.`,
    MAX_MEMBERS_REACHED: (plan, max) =>
      `Your plan (${plan}) allows only ${max} members per project.`,
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
  },

  AUTH: {
    UNAUTHORIZED: "Unauthorized: No email found in token.",
    FORBIDDEN: "You do not have permission to perform this action.",
  },
};
