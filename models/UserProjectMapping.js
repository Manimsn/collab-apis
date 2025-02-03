import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const UserProjectMappingSchema = new mongoose.Schema({
  email: { type: String, required: true },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
  role: {
    type: String,
    enum: ["ADMIN", "VIEWER", "EDITOR", "COMMENTER"],
    required: true,
  },

  // Category-Level Access
  categoryAccess: [
    {
      category: { type: String, required: true },
      role: {
        type: String,
        enum: ["VIEWER", "EDITOR", "COMMENTER"],
        required: true,
      },
    },
  ],

  // File/Folder-Level Access
  fileOrFolderAccess: [
    {
      category: { type: String, required: true },
      files: [
        {
          fileOrFolderId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
          },
          role: {
            type: String,
            enum: ["VIEWER", "EDITOR", "COMMENTER"],
            required: true,
          },
        },
      ],
    },
  ],

  // Invitation Tracking Fields
  status: {
    type: String,
    enum: ["invited", "accepted", "revoked", "expired"],
    default: "invited",
  },
  inviteToken: { type: String, default: uuidv4 }, // Unique token for accepting the invite
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
  }, // Expires in 24 hours

  // Other Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const UserProjectMapping = mongoose.model(
  "UserProjectMapping",
  UserProjectMappingSchema
);
export default UserProjectMapping;
