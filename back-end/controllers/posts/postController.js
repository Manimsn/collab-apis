import { FILETYPE } from "../../config/constants.js";
import { messages } from "../../config/messages.js";
import { isUserAuthorized } from "../../middlewares/authorizationService.js";
import PostFolder from "../../models/postFolderModel.js";
import Project from "../../models/Project.js";
import UserProjectMapping from "../../models/UserProjectMapping.js";
import { checkProjectExists } from "../../services/inviteService.js";
import {
  createPostOrFolderSchema,
  fetchPostsSchema,
  getPostsAndFoldersSchema,
  updateNameSchema,
  updateParentFolderIdSchema,
  updateStatusSchema,
} from "../../validations/postValidation.js";
import { updateNewPostSchema } from "../../validations/updatePostValidataion.js";
import mongoose from "mongoose";

export const createPostOrFolder = async (req, res, next) => {
  try {
    const { userId, email } = req.user; // Extract userId from token

    // ✅ Validate request data
    const validatedData = createPostOrFolderSchema.safeParse({
      ...req.body,
      createdBy: userId, // Inject `createdBy` from token
    });

    if (!validatedData.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validatedData.error.format(),
      });
    }

    const {
      type, // "post" or "folder"
      name,
      parentFolderId,
      projectId,
      category,
      description,
      files,
      isBlocker,
      isFeed,
    } = validatedData.data;

    // Fetch project and validate ownership
    const project = await checkProjectExists(projectId);
    if (!project) {
      return res.status(404).json({ message: messages.PROJECT.NOT_FOUND });
    }

    const isAuthorized = await isUserAuthorized(
      userId,
      email,
      projectId,
      null,
      null,
      false
    );

    if (!isAuthorized) {
      return res
        .status(403)
        .json({ message: "Unauthorized to create this post" });
    }

    // ✅ If `parentFolderId` exists, validate that it refers to an existing folder
    if (parentFolderId) {
      const parentFolder = await PostFolder.findById({ _id: parentFolderId });

      if (!parentFolder) {
        return res.status(400).json({ message: "Parent folder not found." });
      }

      if (parentFolder.type !== FILETYPE.FOLDER) {
        return res
          .status(400)
          .json({ message: "Parent must be a folder, not a post." });
      }
    }

    // ✅ Create a new Post (as a folder or a post)
    const newPostOrFolder = new PostFolder({
      type,
      name: type === FILETYPE.FOLDER ? name : undefined, // Required for folders
      parentFolderId,
      projectId,
      category,
      createdBy: userId,
      description,
      files: type === FILETYPE.POST ? files : [], // Only posts can have files
      isBlocker,
      isFeed,
    });

    await newPostOrFolder.save();

    res.status(201).json({
      message: `${
        type === FILETYPE.POST ? FILETYPE.POST : FILETYPE.FOLDER
      } created successfully`,
      postId: newPostOrFolder._id,
    });
  } catch (error) {
    // console.error("Error creating post/folder:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updatePostFolder = async (req, res) => {
  let session;
  try {
    const { userId, email } = req.user;
    const { postId } = req.params;

    // Validate `postId`
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ error: "Invalid postId format" });
    }

    // Validate request body with Zod
    const validationResult = updateNewPostSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validationResult.error.format(),
      });
    }

    const parsedBody = validationResult.data;
    const updateFields = {};

    if (parsedBody.description?.trim()) {
      updateFields.description = parsedBody.description.trim();
    }
    if (parsedBody.isBlocker) {
      updateFields.isBlocker = parsedBody.isBlocker;
    }
    if (parsedBody.isFeed) {
      updateFields.isFeed = parsedBody.isFeed;
    }

    if (parsedBody.taggedUsers?.length) {
      updateFields.taggedEmails = parsedBody.taggedUsers;
    }

    // Start transaction only if not running in test environment
    if (process.env.NODE_ENV !== "test") {
      session = await mongoose.startSession();
      session.startTransaction();
    }

    // Fetch the existing post
    const post = await PostFolder.findById(postId).session(
      session || undefined
    );
    if (!post) {
      if (session) {
        await session.abortTransaction();
        session.endSession();
      }
      return res.status(404).json({ error: "Post not found" });
    }

    // if (userId !== post.createdBy) {
    //   return res.status(403).json({ error: "Only owner of the post can edit" });
    // }

    // ✅ STEP 1: Handle file deletions separately
    if (parsedBody.deleteFileIds) {
      post.files = post.files.filter(
        (file) => !parsedBody.deleteFileIds.includes(file._id.toString())
      );
      await post.save({ session: session || undefined }); // Save after deletion
    }

    // ✅ STEP 2: Handle updating existing files separately
    if (parsedBody.existingFiles) {
      parsedBody.existingFiles.forEach((updatedFile) => {
        const fileIndex = post.files.findIndex(
          (file) => file._id.toString() === updatedFile._id
        );
        if (fileIndex !== -1) {
          post.files[fileIndex] = {
            ...post.files[fileIndex].toObject(),
            ...updatedFile,
          };
        }
      });
      await post.save({ session: session || undefined }); // Save after updates
    }

    // ✅ STEP 3: Handle adding new files separately
    if (parsedBody.newUploadedFiles) {
      if (post.type !== "POST") {
        if (session) {
          await session.abortTransaction();
          session.endSession();
        }
        return res.status(400).json({
          error: "Files can only be added to a post, not a folder",
        });
      }
      if (post.files.length + parsedBody.newUploadedFiles.length > 20) {
        if (session) {
          await session.abortTransaction();
          session.endSession();
        }
        return res.status(400).json({
          error: "A post cannot have more than 20 files",
        });
      }
      post.files.push(...parsedBody.newUploadedFiles);
      await post.save({ session: session || undefined }); // Save after adding files
    }

    // Apply other field updates
    const updatedPost = await PostFolder.findByIdAndUpdate(
      postId,
      { $set: updateFields },
      { new: true, session: session || undefined }
    );

    // Commit transaction if it was started
    if (session) {
      await session.commitTransaction();
      session.endSession();
    }

    return res
      .status(200)
      .json({ message: "Post updated successfully", post: updatedPost });
  } catch (error) {
    console.error("Update Error:", error);
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Controller to update isBlocker or isFeed dynamically.
 * @route PUT /posts/:postId/update-status
 */
export const updatePostStatus = async (req, res) => {
  try {
    // Validate request body
    const validatedData = updateStatusSchema.parse(req.body);
    const { postId } = req.params;
    const { userId } = req.user; // Assuming userId is available from authentication middleware

    // Find the post and check ownership
    const post = await PostFolder.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    if (post.createdBy.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Unauthorized to update this post." });
    }

    // Update only the provided field
    const updateField = Object.keys(validatedData)[0];
    const updateValue = validatedData[updateField];

    const updatedPost = await PostFolder.findByIdAndUpdate(
      postId,
      { [updateField]: updateValue },
      { new: true }
    );

    return res.status(200).json({
      message: `${updateField} updated successfully.`,
      updatedPost,
    });
  } catch (error) {
    return res
      .status(400)
      .json({ message: error.errors || "Invalid request." });
  }
};

/**
 * GET API to fetch folders and posts in a hierarchical format.
 */
export const getPostsAndFolders = async (req, res) => {
  try {
    const { userId, email } = req.user; // Extract userId from token

    const validationResult = getPostsAndFoldersSchema.safeParse(req.query);

    if (!validationResult.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validationResult.error.format(),
      });
    }

    const { projectId, category } = validationResult.data; // ✅ Use validated data

    // ✅ Check if the project exists
    const project = await checkProjectExists(projectId);

    if (!project) {
      return res.status(404).json({ message: messages.PROJECT.NOT_FOUND });
    }

    let filterQuery = { projectId, category };

    // ✅ Case 1: User is the Project Owner
    if (userId.toString() === project?.createdBy.toString()) {
      // Owner has full access to all folders/posts in the project
      filterQuery = { projectId, category };
    } else {
      // ✅ Case 2 & 3: Check UserProjectMapping for Access Control
      const userMapping = await UserProjectMapping.findOne({
        projectId,
        email,
      }).lean();

      if (!userMapping) {
        return res
          .status(403)
          .json({ message: "Unauthorized to access this project" });
      }

      // ✅ Case 2: Full Category Access
      const hasFullCategoryAccess = userMapping.categoryAccess.some(
        (cat) => cat.category === category
      );

      if (hasFullCategoryAccess) {
        filterQuery = { projectId, category }; // Can access all folders & posts in the category
      } else {
        // ✅ Case 3: Limited File/Folder Access
        const allowedFileOrFolderIds = userMapping.fileOrFolderAccess
          .filter((entry) => entry.category === category)
          .flatMap((entry) => entry.files.map((file) => file.fileOrFolderId));

        if (allowedFileOrFolderIds.length === 0) {
          return res.status(403).json({
            message: "Unauthorized: No access to any folders or posts",
          });
        }

        filterQuery = { _id: { $in: allowedFileOrFolderIds } };
      }
    }

    // ✅ Fetch All Allowed Records
    const allRecords = await PostFolder.find(filterQuery)
      .select(
        "_id name description category type createdBy parentFolderId files updatedAt taggedEmails"
      )
      .sort({ updatedAt: -1 }) // Latest first
      .lean();

    // ✅ Organize Data into a Hierarchical Structure
    const recordMap = new Map();
    const rootItems = [];

    // Step 1: Store all records in a Map
    allRecords.forEach((item) => {
      item.children = []; // Initialize children array
      recordMap.set(item._id.toString(), item);

      if (!item.parentFolderId) {
        rootItems.push(item);
      }
    });

    // Step 2: Attach children to their parent folders
    allRecords.forEach((item) => {
      if (item.parentFolderId) {
        const parent = recordMap.get(item.parentFolderId.toString());
        if (parent) {
          parent.children.push(item);
        }
      }
    });

    res.status(200).json(rootItems);
  } catch (error) {
    console.error("Error fetching posts and folders:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const renamePostOrFolder = async (req, res) => {
  try {
    const { fileId, name } = req.body;
    const { postId } = req.params;
    const userId = req.user.userId;
    const email = req.user.email;

    // Validate input
    const validationResult = updateNameSchema.safeParse({
      postId,
      fileId,
      name,
    });

    if (!validationResult.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validationResult.error.format(),
      });
    }

    // Fetch post
    const post = await PostFolder.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post/Folder not found" });
    }

    // Fetch file IDs from files array
    const fileIds = post ? post?.files.map((f) => f._id) : [];

    if (post.createdBy.toString() !== userId) {
      // Authorization check
      const isAuthorized = await isUserAuthorized(
        userId,
        email,
        post.projectId,
        post?.category,
        fileIds,
        true
      );

      if (!isAuthorized) {
        return res
          .status(403)
          .json({ message: "Unauthorized to update this post" });
      }
    }

    if (post.type === "FOLDER") {
      post.name = name;
    } else if (post.type === "POST") {
      if (!fileId) {
        return res
          .status(400)
          .json({ message: "fileId is required for posts" });
      }
      const file = post.files.find((file) => file._id.toString() === fileId);
      if (!file) {
        return res.status(404).json({ message: "File not found in the post" });
      }
      file.name = name;
    }

    await post.save();
    res.status(200).json({ message: "Update successful" });
  } catch (error) {
    console.error("Error updating post/folder:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getPostsByProjectId = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Validate projectId
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: "Invalid projectId" });
    }

    const posts = await PostFolder.find({ projectId })
      .populate("createdBy", "name email") // Adjust fields as needed
      .populate("parentFolderId", "name") // If you need folder name
      .lean(); // Converts to plain JS object

    console.log(posts);

    if (!posts.length) {
      return res
        .status(404)
        .json({ message: "No posts found for this project" });
    }

    res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateParentFolderId = async (req, res) => {
  const validation = updateParentFolderIdSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      message: "Invalid request data",
      errors: validation.error.errors,
    });
  }

  const { ids, parentFolderId } = validation.data;
  const { userId, email } = req.user;

  try {
    // Check if all provided ids exist
    const existingItems = await PostFolder.find({ _id: { $in: ids } });
    if (existingItems.length !== ids.length) {
      return res.status(404).json({ message: "One or more items not found" });
    }

    // Check if the parent folder exists
    if (parentFolderId) {
      const parentFolder = await PostFolder.findById(parentFolderId);
      if (!parentFolder) {
        return res.status(404).json({ message: "Parent folder not found" });
      }

      if (parentFolder.type !== FILETYPE.FOLDER) {
        return res
          .status(400)
          .json({ message: "Parent must be a folder, not a post" });
      }
    }

    // Authorization check for each item
    for (const item of existingItems) {
      if (item.createdBy.toString() !== userId) {
        const isAuthorized = await isUserAuthorized(
          userId,
          email,
          item.projectId,
          item.category,
          [item._id],
          false
        );

        if (!isAuthorized) {
          return res
            .status(403)
            .json({ message: "Unauthorized to update this post" });
        }
      }
    }

    // Proceed with the update
    await PostFolder.updateMany(
      { _id: { $in: ids } },
      { $set: { parentFolderId } }
    );
    res.status(200).json({ message: "Parent folder ID updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating parent folder ID", error });
  }
};

export const fetchPosts = async (req, res) => {
  try {
    // Validate request parameters
    const params = fetchPostsSchema.parse(req.query);

    let projectIds = [];

    if (params.type === "FEED") {
      // Fetch projects the user owns
      const ownedProjects = await Project.find({
        createdBy: req.user.userId,
      }).select("_id");

      // Fetch projects the user has access to
      const userProjects = await UserProjectMapping.find({
        email: req.user.email,
      }).select("projectId");
      const accessibleProjectIds = userProjects.map((upm) => upm.projectId);

      // Consolidate project IDs
      projectIds = [
        ...ownedProjects.map((p) => p._id),
        ...accessibleProjectIds,
      ];
    } else {
      projectIds = [params.projectId];
    }
    // Fetch posts based on project type and filters
    const postQuery = { projectId: { $in: projectIds }, isFeed: true };
    if (params.type === "DECISION") {
      postQuery.isBlocker = true;
    }
    if (params.createdBy.length > 0) {
      postQuery.createdBy = { $in: params.createdBy };
    }
    if (params.categories.length > 0) {
      postQuery.category = { $in: params.categories };
    }
    if (params.taggedEmails.length > 0) {
      postQuery.taggedEmails = { $in: params.taggedEmails };
    }

    // Pagination
    const skip = (params.page - 1) * params.limit;
    const totalPosts = await PostFolder.countDocuments(postQuery);
    const totalPages = Math.ceil(totalPosts / params.limit);

    // Fetch posts with pagination and sorting
    const posts = await PostFolder.find(postQuery)
      .sort({ createdAt: params.sortOrder })
      .skip(skip)
      .limit(params.limit);

    // Response with pagination metadata
    res.json({
      posts,
      pagination: {
        totalPosts,
        totalPages,
        currentPage: params.page,
        limit: params.limit,
      },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
