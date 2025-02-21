import mongoose from "mongoose";

import Project from "../../models/Project.js";
import UserProjectMapping from "../../models/UserProjectMapping.js";

import { isProjectNameTaken } from "../../services/projectService.js";
import {
  projectIdSchema,
  projectSchema,
  updateProjectSchema,
} from "../../validations/projectValidation.js";

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
    const { projectId } = req.params;
    const userEmail = req.user.email;

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

    // 🔹 Find the project by ID (using lean() for performance)
    const project = await Project.findById(projectId).lean();

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // 🔹 Ensure the user is the project owner
    if (project.ownerEmail !== userEmail) {
      return res
        .status(403)
        .json({ message: "Unauthorized to update this project" });
    }

    // 🔹 Prevent updating the same name
    if (validatedData.data.name && validatedData.data.name === project.name) {
      return res.status(400).json({
        message: "Project name is already the same. No changes detected.",
      });
    }

    // 🔹 Check if another project already has this name (excluding the current one)
    if (validatedData.data.name) {
      // const existingProject = await Project.findOne({
      //   name: validatedData.data.name,
      //   _id: { $ne: projectId }, // Exclude current project
      // });
      const existingProject = await isProjectNameTaken(validatedData.data.name);

      if (existingProject) {
        return res.status(400).json({
          message:
            "Project name already exists. Please choose a different name.",
        });
      }
    }

    // 🔹 Update project fields (more efficient than Object.assign)
    await Project.updateOne(
      { _id: projectId },
      { ...validatedData.data, updatedAt: Date.now() }
    );

    res.status(200).json({
      message: "Project updated successfully",
      projectId,
      projectId: project._id,
    });
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getUserProjects = async (req, res) => {
  try {
    const userId = req.user.userId; // Extract userId from token
    const userEmail = req.user.email; // Extract email from token

    // Fetch projects created by the user
    const ownedProjects = await Project.find({ createdBy: userId })
      .select("_id name updatedAt")
      .lean();

    // Attach 'owner' role to owned projects
    const ownedProjectsFormatted = ownedProjects.map((project) => ({
      ...project,
      role: "owner",
    }));

    // Fetch project mappings where the user has been invited
    const userMappings = await UserProjectMapping.find({
      email: userEmail,
      status: "invited", //accepted
    })
      .select("projectId")
      .lean();

    // Extract projectIds from user mappings
    const projectIds = userMappings.map((mapping) => mapping.projectId);

    // Fetch project details for accessed projects
    const accessedProjects = await Project.find({ _id: { $in: projectIds } })
      .select("_id name updatedAt")
      .lean();

    // Combine both owned and accessed projects
    const finalProjects = [...ownedProjectsFormatted, ...accessedProjects];

    // Sort projects by updatedAt (latest first)
    finalProjects.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    return res.status(200).json(finalProjects);
  } catch (error) {
    console.error("Error fetching user projects:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getUserAllowedCategories = async (req, res) => {
  try {
    // ✅ Validate request params using Zod
    const validationResult = projectIdSchema.safeParse(req.params);
    if (!validationResult.success) {
      return res
        .status(400)
        .json({ message: validationResult.error.errors[0].message });
    }

    const { projectId } = validationResult.data;
    const userEmail = req.user.email; // Extract email from token

    // 🔹 Step 1: Check if the user is the project owner
    const project = await Project.findOne({
      _id: projectId,
      ownerEmail: userEmail,
    });

    if (project) {
      return res.status(200).json({ allowedCategories: "ALL" });
    }

    // 🔹 Step 2: Check UserProjectMapping for role-based access
    const userMapping = await UserProjectMapping.findOne({
      projectId,
      email: userEmail,
    }).lean();

    if (!userMapping) {
      return res.status(403).json({ message: "No access to this project." });
    }

    // If the user has a `role`, they get full access
    if (userMapping.role) {
      return res.status(200).json({ allowedCategories: "ALL" });
    }

    // 🔹 Step 3: Check category-based access
    let allowedCategories = new Set();

    if (userMapping.categoryAccess.length > 0) {
      userMapping.categoryAccess.forEach((access) =>
        allowedCategories.add(access.category)
      );
    }

    if (userMapping.fileOrFolderAccess.length > 0) {
      userMapping.fileOrFolderAccess.forEach((access) =>
        allowedCategories.add(access.category)
      );
    }

    if (allowedCategories.size > 0) {
      return res
        .status(200)
        .json({ allowedCategories: Array.from(allowedCategories) });
    }

    // 🔹 Step 4: If no category access, deny access
    return res.status(403).json({ message: "No access to this project." });
  } catch (error) {
    console.error("Error fetching allowed categories:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getOneProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ error: "Invalid project ID" });
    }

    const project = await Project.findById(projectId).populate(
      "createdBy",
      "name email"
    ); // Adjust populated fields as needed

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.status(200).json(project);
  } catch (error) {
    console.error("Error fetching project:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAccessList = async (req, res) => {
  try {
    const { projectId } = req.query;
    const email = req.user.email;

    // Validate input
    if (!projectId || !email) {
      return res
        .status(400)
        .json({ error: "Both projectId and email are required" });
    }

    // Find user-project mapping
    const mapping = await UserProjectMapping.findOne({ projectId, email })
      .populate("projectId", "name location") // Populate project details
      .populate("createdBy", "name email"); // Populate creator details

    if (!mapping) {
      return res.status(404).json({ error: "Mapping not found" });
    }

    res.status(200).json(mapping);
  } catch (error) {
    console.error("Error fetching user project mapping:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
