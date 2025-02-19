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
        if (Array.isArray(item.files)) {
          item.files.forEach((file) => {
            // Determine the correct parentFolderId for each file
            const fileParentId =
              item.hasDifferentParent && file.parentFolderId
                ? file.parentFolderId.toString()
                : item.parentFolderId?.toString();

            file.parentFolderId = fileParentId || null; // Attach correct parentFolderId for verification

            if (fileParentId) {
              // Attach file to its correct parent
              const parent = recordMap.get(fileParentId);
              if (parent) {
                parent.children.push(file);
              }
            } else {
              // If no parent, treat file as root
              rootItems.push(file);
            }
          });
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
