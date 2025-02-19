import { z } from "zod";
import mongoose from "mongoose";
import PostFolder from "../../models/postFolderModel.js";

// ✅ Zod schema for validating request payload
const fetchPostFolderSchema = z.object({
  projectId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid projectId",
  }),
  category: z.string().min(1, "Category is required"),
});

/**
 * Fetch hierarchical records (Folders, Files from Posts, Links) based on projectId and category.
 */
export const fetchPostFolderHierarchy = async (req, res) => {
  try {
    // ✅ Validate request data using Zod
    const validatedData = fetchPostFolderSchema.safeParse(req.query);

    if (!validatedData.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validatedData.error.format(),
      });
    }

    const { projectId, category } = validatedData.data;

    // ✅ Fetch all records for the given projectId and category
    const allRecords = await PostFolder.find({ projectId, category }).lean();

    if (!allRecords.length) {
      return res.status(404).json({ message: "No records found." });
    }

    // ✅ Organize Data into a Hierarchical Structure
    const recordMap = new Map();
    const rootItems = [];

    // Step 1: Store all records in a Map
    allRecords.forEach((item) => {
      console.log(item.FOLDER);
      if (item.type === "FOLDER") {
        item.children = []; // Initialize children array
      }
      recordMap.set(item._id.toString(), item);

      if (!item.parentFolderId) {
        rootItems.push(item);
      }
    });

    // Step 2: Attach children to their parent folders
    allRecords.forEach((item) => {
      if (item.type === "POST") {
        // Ensure post.files exists before modifying
        if (Array.isArray(item.files)) {
          item.files.forEach((file) => {
            file.parentFolderId = item.parentFolderId || null; // Attach parentFolderId for verification
          });

          if (item.parentFolderId) {
            // Attach only files to the parent folder
            const parent = recordMap.get(item.parentFolderId.toString());
            if (parent) {
              parent.children.push(...item.files);
            }
          } else {
            // If it's a root POST, add files to rootItems
            rootItems.push(...item.files);
          }
        }
      } else if (item.parentFolderId) {
        // Normal handling for FOLDERS and FILES
        const parent = recordMap.get(item.parentFolderId.toString());
        if (parent) {
          parent.children.push(item);
        }
      }
    });

    res.status(200).json(rootItems);
  } catch (error) {
    console.error("Error fetching post/folder hierarchy:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
