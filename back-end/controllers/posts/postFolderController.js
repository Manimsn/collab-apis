import PostFolder from "../../models/postFolderModel.js";
import User from "../../models/User.js";
import UserProjectMapping from "../../models/UserProjectMapping.js";
import {
  fetchPostFolderSchema,
  fileAccessSchema,
  updateParentFolderSchema,
} from "../../validations/fileFolderValidation.js";

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
            file.postId = item._id.toString(); // Attach postId for verification

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

export const getFilesByProjectAndCategory = async (req, res) => {
  try {
    const { projectId, category } = req.query;

    if (!projectId || !category) {
      return res
        .status(400)
        .json({ message: "projectId and category are required" });
    }

    const folders = await PostFolder.find({ projectId, category }).lean();

    if (!folders.length) {
      return res.status(404).json({
        message: "No files found for the given projectId and category.",
      });
    }

    const files = folders.flatMap((folder) => folder.files);
    res.status(200).json(folders);
  } catch (error) {
    console.error("Error fetching files:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserProjectMappingById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "_id parameter is required" });
    }

    const userProjectMapping = await UserProjectMapping.findById(id).lean();

    if (!userProjectMapping) {
      return res
        .status(404)
        .json({ message: "No record found with the given _id" });
    }

    res.status(200).json(userProjectMapping);
  } catch (error) {
    console.error("Error fetching user project mapping:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateFilesParentFolder = async (req, res) => {
  try {
    // Validate request body

    const validatedData = updateParentFolderSchema.safeParse(req.body);

    if (!validatedData.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validatedData.error.format(),
      });
    }

    const { parentFolderId, files, folderAndLinks } = validatedData.data;

    // Check if parentFolderId exists and is of type "FOLDER"
    const parentFolder = await PostFolder.findOne({
      _id: parentFolderId,
      type: "FOLDER",
    });

    if (!parentFolder) {
      return res.status(400).json({
        message: "Invalid parentFolderId. It must be a FOLDER.",
      });
    }

    let filesUpdateResult = null;
    let foldersUpdateResult = null;
    let failedFilesUpdates = [];
    let failedFoldersUpdates = [];

    // If files array exists and is not empty, update files.parentFolderId
    if (files && files.length > 0) {
      // Fix: Do not group by postId, handle updates independently
      const bulkFileUpdates = files.map(({ _id, postId }) => ({
        updateOne: {
          filter: { _id: postId, "files._id": _id }, // Ensure only the correct file is updated
          update: {
            $set: { "files.$.parentFolderId": parentFolderId }, // Use `$` instead of `$[elem]`
          },
        },
      }));

      // Execute bulk update for files
      filesUpdateResult = await PostFolder.bulkWrite(bulkFileUpdates);

      // Step 2: Update `hasDifferentParent = true` separately
      const bulkHasDifferentParentUpdates = [
        ...new Set(files.map(({ postId }) => postId)),
      ].map((postId) => ({
        updateOne: {
          filter: { _id: postId },
          update: { $set: { hasDifferentParent: true } },
        },
      }));

      await PostFolder.bulkWrite(bulkHasDifferentParentUpdates);

      // Fetch updated posts to verify which file updates were successful
      const updatedPosts = await PostFolder.find(
        { _id: { $in: files.map(({ postId }) => postId) } },
        { files: 1 }
      ).lean();

      // Extract successfully updated file IDs
      const successfullyUpdatedFiles = new Set();
      updatedPosts.forEach((post) => {
        post.files.forEach((file) => {
          if (file.parentFolderId?.toString() === parentFolderId.toString()) {
            successfullyUpdatedFiles.add(file._id.toString());
          }
        });
      });

      // Capture failed file updates (including partial failures within a postId group)
      failedFilesUpdates = files
        .filter(({ _id }) => !successfullyUpdatedFiles.has(_id))
        .map(({ _id, postId }) => ({
          _id,
          postId,
          reason: "File not found or update failed",
        }));
    }

    // If folderAndLinks array exists and is not empty, update PostFolder parentFolderId
    if (folderAndLinks && folderAndLinks.length > 0) {
      const existingFolders = await PostFolder.find({
        _id: { $in: folderAndLinks },
      }).select("_id");

      const existingFolderIds = existingFolders.map((folder) =>
        folder._id.toString()
      );

      foldersUpdateResult = await PostFolder.updateMany(
        { _id: { $in: existingFolderIds } },
        { $set: { parentFolderId } }
      );

      // Capture failed folderAndLinks updates
      failedFoldersUpdates = folderAndLinks
        .filter((id) => !existingFolderIds.includes(id))
        .map((id) => ({
          _id: id,
          reason: "Folder/Link not found or update failed",
        }));
    }

    return res.status(200).json({
      success:
        failedFilesUpdates.length === 0 && failedFoldersUpdates.length === 0,
      message:
        failedFilesUpdates.length || failedFoldersUpdates.length
          ? "Some updates failed"
          : "All updates successful",
      filesModified: filesUpdateResult ? filesUpdateResult.modifiedCount : 0,
      foldersModified: foldersUpdateResult
        ? foldersUpdateResult.modifiedCount
        : 0,
      failedFilesUpdates,
      failedFoldersUpdates,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getUsersWithFileAccess = async (req, res) => {
  try {
    // ✅ Validate query parameters
    const validation = fileAccessSchema.safeParse(req.query);
    if (!validation.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validation.error.format(),
      });
    }

    // Extract validated values
    const { projectId, category, fileOrFolderId } = validation.data;

    // ✅ Query UserProjectMapping to get emails with file access
    const userMappings = await UserProjectMapping.find(
      {
        projectId,
        fileOrFolderAccess: {
          $elemMatch: {
            category: category,
            files: { $elemMatch: { fileOrFolderId: fileOrFolderId } },
          },
        },
        role: { $exists: false },
        status: "invited",
      },
      { email: 1, _id: 0 }
    );

    // Extract unique emails
    const emails = [...new Set(userMappings.map((u) => u.email))];
    console.log(emails);

    if (emails.length === 0) {
      return res
        .status(404)
        .json({ message: "No users found with file access" });
    }

    // ✅ Query User collection to get user details
    const users = await User.find(
      { email: { $in: emails } },
      { _id: 1, firstName: 1, lastName: 1, email: 1 }
    );

    return res.status(200).json({ users });
  } catch (error) {
    console.error("Error fetching users with file access:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
