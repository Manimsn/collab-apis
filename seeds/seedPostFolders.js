import mongoose from "mongoose";
import { categoryEnum } from "../config/constants.js";
import PostFolder from "../models/postFolderModel.js";
import Project from "../models/Project.js";
import User from "../models/User.js";
import UserProjectMapping from "../models/UserProjectMapping.js";

// Define allowed file types per category
const categoryFileTypes = {
  Drawings: ["image/png", "image/jpeg", "application/pdf"],
  Images: ["image/png", "image/jpeg"],
  Panoramas: ["image/png", "image/jpeg"],
  Renderings: ["application/pdf", "image/png", "image/jpeg"],
  SideBySide: ["image/png", "image/jpeg"],
  Videos: ["video/mp4", "video/mkv"],
  Specification: ["application/pdf", "image/png", "image/jpeg"],
  MoodBoard: ["application/pdf", "application/msword"],
  "3DModels": ["model/gltf+json", "model/obj", "model/fbx"],
  Survey: ["application/pdf", "application/msword"],
  Files: ["image/png", "image/jpeg", "application/pdf"],
};

// Function to generate random files based on category
const generateFilesForCategory = (category) => {
  const fileTypes = categoryFileTypes[category] || [];
  const numFiles = Math.floor(Math.random() * 5) + 1; // 1 to 5 files
  return Array.from({ length: numFiles }, (_, i) => ({
    name: `${category}_File_${i + 1}`,
    fileType: fileTypes[Math.floor(Math.random() * fileTypes.length)],
    description: `Auto-generated file for ${category}`,
  }));
};

// Function to randomly assign boolean or null
const getRandomBooleanOrNull = () => {
  const values = [true, false, null];
  return values[Math.floor(Math.random() * values.length)];
};

export const seedPostFolders = async () => {
  const existingCount = await PostFolder.countDocuments();
  if (existingCount > 0) {
    console.log("✅ PostFolder already seeded.");
    return;
  }

  const projects = await Project.find();
  const maxRecords = 10000;
  let currentRecordCount = 0;

  for (const project of projects) {
    if (currentRecordCount >= maxRecords) break;
    console.log(`🚀 Seeding for project: ${project.name}`);

    // Fetch team members (users with "ADMIN" or "EDITOR" access)
    const teamMappings = await UserProjectMapping.find({
      projectId: project._id,
    });
    const adminOrEditorUsers = await User.find({
      email: {
        $in: teamMappings
          .filter((m) => ["ADMIN", "EDITOR"].includes(m.role))
          .map((m) => m.email),
      },
    });

    // Possible `createdBy` users (including the project owner)
    const possibleCreators = [
      ...adminOrEditorUsers,
      await User.findById(project.createdBy),
    ];
    if (possibleCreators.length === 0) {
      console.warn(
        `⚠️ No valid creators found for project ${project.name}, skipping.`
      );
      continue;
    }

    // Select 3 random categories
    const selectedCategories = categoryEnum
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);

    for (const category of selectedCategories) {
      let folders = [];
      let posts = [];

      // Create 5 folders (randomly placed as root, nested, or deeply nested)
      for (let i = 0; i < 5; i++) {
        const parentFolder =
          i > 0
            ? folders[Math.floor(Math.random() * folders.length)]._id
            : null;
        const folder = new PostFolder({
          type: "FOLDER",
          name: `${category}_Folder_${i + 1}`,
          projectId: project._id,
          category,
          parentFolderId: parentFolder,
          createdBy:
            possibleCreators[
              Math.floor(Math.random() * possibleCreators.length)
            ]._id,
          taggedEmails: [],
        });
        await folder.save();
        folders.push(folder);
        currentRecordCount++;
      }

      // Create 20 posts (randomly placed as root, nested, or deeply nested)
      for (let i = 0; i < 20; i++) {
        if (currentRecordCount >= maxRecords) break;

        const parentFolder =
          folders.length > 0
            ? folders[Math.floor(Math.random() * folders.length)]._id
            : null;
        const post = new PostFolder({
          type: "POST",
          name: `${category}_Post_${i + 1}`,
          projectId: project._id,
          category,
          parentFolderId: parentFolder,
          createdBy:
            possibleCreators[
              Math.floor(Math.random() * possibleCreators.length)
            ]._id,
          taggedEmails: teamMappings.length
            ? teamMappings.filter(() => Math.random() > 0.5).map((m) => m.email)
            : [],
          isBlocker: getRandomBooleanOrNull(),
          isFeed: getRandomBooleanOrNull(),
          files: generateFilesForCategory(category),
        });
        await post.save();
        posts.push(post);
        currentRecordCount++;
      }

      if (currentRecordCount >= maxRecords) break;
    }
  }
  console.log("✅ Posts & Folders seeded.");
};
