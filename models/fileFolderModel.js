import mongoose from "mongoose";
import { categoryEnum } from "../config/constants.js";

const fileFolderSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["file", "folder"],
      required: true,
    },
    name: { type: String, required: true },
    fileType: {
      type: String,
      required: function () {
        return this.type === "file";
      },
    },
    description: { type: String },
    // parentFolderId: { type: mongoose.Schema.Types.ObjectId, ref: "FileFolder" },
    parentFolderId: {
      type: mongoose.Schema.Types.Mixed, // Allows ObjectId or String
      required: true,
      validate: {
        validator: function (val) {
          if (val === "ROOT") return true;
          return mongoose.Types.ObjectId.isValid(val);
        },
        message: "parentFolderId must be 'ROOT' or a valid ObjectId",
      },
      ref: "FileFolder", // Only applies when it's an ObjectId
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Project",
    },
    category: {
      type: String,
      enum: categoryEnum,
      required: true,
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Post",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

const FileFolder = mongoose.model("FileFolder", fileFolderSchema);
export default FileFolder;
