import Project from "../../models/Project.js";
import { isProjectNameTaken } from "../../services/projectService.js";
import {
  projectSchema,
  updateProjectSchema,
} from "../../validations/projectValidation.js";
import mongoose from "mongoose";

export const createProject = async (req, res) => {
  try {
    // ✅ Validate request body using Zod
    const validatedData = projectSchema.safeParse(req.body);

    if (!validatedData.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validatedData.error.format(),
      });
    }
    const userId = req.user.userId; // Extract userId from token
    const email = req.user.email; // Extract userId from token

    // ✅ Check if the project name already exists
    const existingProject = await isProjectNameTaken(validatedData.data.name);

    if (existingProject) {
      return res.status(400).json({
        message: "Project name already exists. Please choose a different name.",
      });
    }

    // ✅ Create new project
    const newProject = new Project({
      ...validatedData.data,
      createdBy: userId,
      ownerEmail: email,
    });

    await newProject.save();

    res.status(201).json({
      message: "Project created successfully",
      projectId: newProject._id,
    });
  } catch (error) {
    console.error("Error creating project:", error);

    // 🔹 Handle MongoDB duplicate key error
    if (error.code === 11000 && error.keyPattern.name) {
      return res.status(400).json({
        message: "Project name already exists. Please choose a different name.",
      });
    }

    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateProject = async (req, res) => {
  try {
    

    const { projectId } = req.params; // Extract project ID from URL
    const userEmail = req.user.email; // Extract user's email from token

    // 🔹 Validate projectId before making a query
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: "Invalid project ID format." });
    }

    const validatedData = updateProjectSchema.safeParse(req.body);

    if (!validatedData.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validatedData.error.format(),
      });
    }
    console.log("validatedData", validatedData.data);

    // 🔹 Find the project by ID
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // 🔹 Ensure the user is the project owner
    if (project.ownerEmail !== userEmail) {
      return res
        .status(403)
        .json({ message: "Unauthorized to update this project" });
    }

    // 🔹 Check if the new name already exists (if updating name)
    if (validatedData.data.name && validatedData.data.name === project.name) {
      console.log("ïf");
      const existingProject = await isProjectNameTaken(validatedData.data.name);

      if (existingProject) {
        return res.status(400).json({
          message:
            "Project name already exists. Please choose a different name.",
        });
      }
    }

    // 🔹 Update project fields
    Object.assign(project, validatedData.data, { updatedAt: Date.now() });

    await project.save();

    res.status(200).json({
      message: "Project updated successfully",
      projectId: project._id,
    });
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
