import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // 🔹 Enforce unique constraint
  description: { type: String },
  location: { type: String, required: true },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// 🔹 Create a unique index for `name`
ProjectSchema.index({ name: 1 }, { unique: true });

const Project = mongoose.model("Project", ProjectSchema);
export default Project;
