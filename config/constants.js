// 🔹 Plan Limits for Different Subscription Plans
export const planLimits = {
  FREE: {
    maxProjects: 2,
    maxMembersPerProject: 2,
    maxMembersPerProjectExternal: 5,
  },
  BASIC: {
    maxProjects: 5,
    maxMembersPerProject: 5,
    maxMembersPerProjectExternal: 10,
  },
  PREMIUM: {
    maxProjects: 10,
    maxMembersPerProject: 10,
    maxMembersPerProjectExternal: 15,
  },
  ENTERPRISE: {
    maxProjects: Infinity,
    maxMembersPerProject: Infinity,
    maxMembersPerProjectExternal: 20,
  }, // No limits
};

// 🔹 User Roles
export const OWNERROLE = {
  OWNER: "OWNER",
};

export const ADMINROLE = {
  ADMIN: "ADMIN",
};

export const ROLES = {
  VIEWER: "VIEWER",
  EDITOR: "EDITOR",
  COMMENTER: "COMMENTER",
};

export const NON_OWNER_ROLES = {
  ...ADMINROLE,
  ...ROLES,
};

export const USERROLES = {
  ...OWNERROLE,
  ...ADMINROLE,
  ...ROLES,
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
export const FILETYPE = {
  POST: "POST",
  FOLDER: "FOLDER",
  LINK: "LINK",
};

export const FileTypeEnum = ["POST", "FOLDER", "LINK"];

export const categories = {
  DRAWINGS: "Drawings",
  IMAGES: "Images",
  PANORAMA: "Panoramas",
  RENDERINGS: "Renderings",
  SIDEBYSIDE: "SideBySide",
  VIDEO: "Videos",
  SPECIFICATION: "Specification",
  MOODBAORD: "MoodBoard",
  THREEDMODELS: "3DModels",
  SURVEY: "Survey",
  FILES: "Files",
};

export const categoryEnum = [
  categories.DRAWINGS,
  categories.IMAGES,
  categories.PANORAMA,
  categories.RENDERINGS,
  categories.VIDEO,
  categories.SPECIFICATION,
  categories.SIDEBYSIDE,
  categories.MOODBAORD,
  categories.THREEDMODELS,
  categories.SURVEY,
  categories.FILES,
];

export const fileTypes = {
  images: "image/*",
  pdf: "application/pdf",
  threeDModels: [
    "model/gltf+json", // GLTF
    "model/gltf-binary", // GLB
    "model/stl", // STL
    "model/obj", // OBJ
    "model/mtl", // MTL
    "application/vnd.ms-3mfdocument", // 3MF
  ],
  videos: "video/*",
};

export const categoryFileTypes = [
  {
    categoryName: categories.DRAWINGS,
    fileTypes: [fileTypes.images, fileTypes.pdf],
  },
  {
    categoryName: categories.IMAGES,
    fileTypes: [fileTypes.images],
  },
  {
    categoryName: categories.PANORAMA,
    fileTypes: [fileTypes.images],
  },
  {
    categoryName: categories.RENDERINGS,
    fileTypes: [fileTypes.images, fileTypes.pdf],
  },
  {
    categoryName: categories.VIDEO,
    fileTypes: [fileTypes.videos],
  },
  {
    categoryName: categories.SPECIFICATION,
    fileTypes: [fileTypes.images, fileTypes.pdf],
  },
  {
    categoryName: categories.MOODBAORD,
    fileTypes: [fileTypes.pdf],
  },
  {
    categoryName: categories.THREEDMODELS,
    fileTypes: [fileTypes.threeDModels],
  },
  {
    categoryName: categories.SURVEY,
    fileTypes: [fileTypes.pdf],
  },
  {
    categoryName: categories.FILES,
    fileTypes: [fileTypes.pdf],
  },
];
