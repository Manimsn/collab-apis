import Project from "../models/Project.js"; // Adjust path as needed

export const isProjectNameTaken = async (name) => {
  return await Project.findOne({ name });
};
