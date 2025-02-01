import { z } from "zod";
import Project from "../models/Project.js";

// Define Zod schema for project validation
const projectSchema = z.object({
  name: z.string().min(3, "Project name must be at least 3 characters long"),
  description: z.string().optional(),
  location: z.string().min(3, "Location must be at least 3 characters long"),
});

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

    // ✅ Create new project (only if validation passes)
    const newProject = new Project({
      ...validatedData.data,
      createdBy: userId,
    });

    await newProject.save();

    res.status(201).json({
      message: "Project created successfully",
      projectId: newProject._id,
    });
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
