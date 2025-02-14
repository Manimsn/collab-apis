import mongoose from "mongoose";
import Project from "../../models/Project.js"; // Import the Project model
import { users } from "./users.js"; // Import predefined users

// ✅ Predefined sample projects
export const projects = {
  manishOwnedProject: {
    _id: new mongoose.Types.ObjectId(),
    name: "Manish's Private Project",
    description: "Project owned and managed by Manish",
    location: "New York",
    createdBy: users.manishUser._id, // ✅ Manish is the owner
    ownerEmail: "manish@gmail.com",
    updatedAt: new Date("2024-02-14T10:00:00Z"),
  },
  manishSharedProject: {
    _id: new mongoose.Types.ObjectId(),
    name: "Manish's Shared Project",
    description: "Project owned by Manish but shared with others",
    location: "Los Angeles",
    createdBy: users.manishUser._id, // ✅ Manish is the owner
    ownerEmail: "manish@gmail.com",
    updatedAt: new Date("2024-02-13T08:30:00Z"),
  },
  anuOwnedProject: {
    _id: new mongoose.Types.ObjectId(),
    name: "Anu's Private Project",
    description: "Project fully owned and managed by Anu",
    location: "Chicago",
    createdBy: users.anuUser._id, // ✅ Anu is the owner
    ownerEmail: "anu@gmail.com",
    updatedAt: new Date("2024-02-12T14:15:00Z"),
  },
  editorOwnedProject: {
    _id: new mongoose.Types.ObjectId(),
    name: "Editor-Managed Project",
    description: "Project created by an editor for collaboration",
    location: "San Francisco",
    createdBy: users.editorUser._id, // ✅ Created by an editor
    ownerEmail: "editor@example.com",
    updatedAt: new Date("2024-02-11T16:45:00Z"),
  },
  publicProject: {
    _id: new mongoose.Types.ObjectId(),
    name: "Publicly Available Project",
    description: "A project accessible to multiple users",
    location: "Seattle",
    createdBy: users.manishUser._id, // ✅ Still owned by Manish
    ownerEmail: "manish@gmail.com",
    updatedAt: new Date("2024-02-10T11:30:00Z"),
  },
};

// ✅ Function to insert sample projects into the test database
export const insertProjects = async () => {
  await Project.insertMany(Object.values(projects));
};

// ✅ Function to delete all projects from the test database
export const deleteProjects = async () => {
  await Project.deleteMany({});
};
