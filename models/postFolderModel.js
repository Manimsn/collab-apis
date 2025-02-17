import mongoose from "mongoose";
import { categoryEnum } from "../config/constants.js";

const fileSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    fileType: { type: String, required: true },
    description: { type: String },
    // createdBy: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   required: true,
    //   ref: "User",
    // },
  }
  // { _id: false } // Prevents MongoDB from creating an unnecessary `_id` for each file
);

const postSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["POST", "FOLDER"],
      required: true,
    },
    name: {
      type: String,
      required: function () {
        return this.type === "FOLDER";
      },
    }, // Only required for folders
    description: { type: String },
    isBlocker: {
      type: Boolean,
      default: null, // Ensures it is null if not provided
    },
    isFeed: {
      type: Boolean,
      default: null, // Ensures it is null if not provided
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Project",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    category: {
      type: String,
      enum: categoryEnum,
      required: true,
    },
    parentFolderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post", // Points to another post acting as a folder
      default: null,
    },
    taggedEmails: {
      type: [String],
      validate: {
        validator: function (emails) {
          return emails.every((email) =>
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
          );
        },
        message: "Each tagged email must be a valid email address.",
      },
      default: [],
    },

    files: {
      type: [fileSchema],
      validate: {
        validator: function (files) {
          return this.type === "POST" ? files.length <= 20 : true; // Only posts can have files
        },
        message: "A post cannot have more than 20 files.",
      },
    },
  },
  { timestamps: true }
);

const PostFolder = mongoose.model("PostFolder", postSchema);
export default PostFolder;

// updating file name consider this recommendation
// await Post.updateOne(
//     { _id: postId, "files.name": "oldFileName.pdf" }, // Find the post containing the file
//     { $set: { "files.$[elem].name": "newFileName.pdf" } }, // Change only the file name
//     { arrayFilters: [{ "elem.name": "oldFileName.pdf" }] } // Apply only to the matching file
//   );

// const existingFile = await Post.findOne({
//     _id: postId,
//     "files.name": "newFileName.pdf",
//   });

//   if (existingFile) {
//   } else {
//     await Post.updateOne(
//       { _id: postId, "files.name": "oldFileName.pdf" },
//       { $set: { "files.$[elem].name": "newFileName.pdf" } },
//       { arrayFilters: [{ "elem.name": "oldFileName.pdf" }] }
//     );
//     console.log("File name updated successfully!");
//   }
