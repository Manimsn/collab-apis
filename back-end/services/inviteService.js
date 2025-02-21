import Project from "../models/Project.js";
import UserProjectMapping from "../models/UserProjectMapping.js";

export const checkProjectExists = async (projectId) => {
  return await Project.findById(projectId);
};

export const checkUserProjectAccess = async (projectId, email) => {
  return await UserProjectMapping.findOne({ projectId, email });
};

export const countProjectMembers = async (projectId) => {
  return await UserProjectMapping.countDocuments({ projectId });
};

export const countCategoryMembers = async (projectId, category) => {
  return await UserProjectMapping.countDocuments({
    projectId,
    "categoryAccess.category": category,
  });
};
