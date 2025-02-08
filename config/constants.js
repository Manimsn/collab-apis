// 🔹 Plan Limits for Different Subscription Plans
export const planLimits = {
  FREE: { maxProjects: 2, maxMembersPerProject: 2 },
  BASIC: { maxProjects: 5, maxMembersPerProject: 5 },
  PREMIUM: { maxProjects: 10, maxMembersPerProject: 10 },
  ENTERPRISE: { maxProjects: Infinity, maxMembersPerProject: Infinity }, // No limits
};

// 🔹 User Roles
export const userRoles = {
  OWNER: "OWNER",
  ADMIN: "ADMIN",
  VIEWER: "VIEWER",
  EDITOR: "EDITOR",
  COMMENTER: "COMMENTER",
};

// 🔹 Other Common Variables (Modify as Needed)
export const inviteSettings = {
  expirationTime: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
};

// 🔹 Invitation Status Enum
export const inviteStatus = {
  INVITED: "invited",
  ACCEPTED: "accepted",
  REVOKED: "revoked",
  EXPIRED: "expired",
};

export const categoryEnum = [
  "Drawings",
  "Images",
  "Panoramas",
  "Renderings",
  "SideBySide",
  "Videos",
  "Specification",
  "MoodBoard",
  "3DModels",
  "Survey",
  "Files",
];
