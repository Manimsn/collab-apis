import mongoose from "mongoose";
import { categoryEnum } from "../config/constants.js";

const postSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
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
    description: { type: String },
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);
export default Post;
