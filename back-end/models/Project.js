import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  location: { type: String, required: true },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  ownerEmail: {
    type: String,
    required: true,
  }, // ✅ Store owner email directly

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// 🔹 Ensure unique index is created properly
ProjectSchema.index({ name: 1 }, { unique: true });

const Project = mongoose.model("Project", ProjectSchema);
export default Project;
