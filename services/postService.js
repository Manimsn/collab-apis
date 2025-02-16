import Post from "../models/postModel.js";
import FileFolder from "../models/fileFolderModel.js";

/**
 * Updates a post and related file details.
 * @param {String} postId - The ID of the post to update.
 * @param {Object} updateData - The updated fields for the post.
 * @returns {Object} - Response object with update status.
 */
export const updatePostWithFiles = async (postId, updateData) => {
  try {
    // Fetch existing post
    const existingPost = await Post.findById({ _id: postId });

    if (!existingPost) {
      return { success: false, status: 404, message: "Post not found" };
    }

    // Fetch existing files
    const fileIds = updateData.files
      ? updateData.files.map((file) => file.fileId)
      : [];
    const existingFiles = await FileFolder.find({
      _id: { $in: fileIds },
      postId,
    });
    console.log("existingFiles", existingFiles);

    // Skip update if fields haven't changed
    const updatedFields = {};
    if (
      updateData.description &&
      updateData.description !== existingPost.description
    ) {
      updatedFields.description = updateData.description;
    }
    if (
      updateData.taggedUsers &&
      JSON.stringify(updateData.taggedUsers) !==
        JSON.stringify(existingPost.taggedUsers)
    ) {
      updatedFields.taggedUsers = updateData.taggedUsers;
    }

    if (
      Object.keys(updatedFields).length === 0 &&
      (!updateData.files || updateData.files.length === 0)
    ) {
      return { success: false, status: 400, message: "No changes detected." };
    }

    // Update post only if fields changed
    if (Object.keys(updatedFields).length > 0) {
      updatedFields.updatedAt = new Date();
      await Post.updateOne({ _id: postId }, { $set: updatedFields });
    }

    // Update files only if fileName or description has changed
    if (updateData.files && updateData.files.length > 0) {
      const bulkUpdates = updateData.files
        .map((file) => {
          const existingFile = existingFiles.find(
            (f) => f._id.toString() === file.fileId
          );
          if (!existingFile) return null; // Skip if file doesn't exist

          // Check if fileName or description changed
          const fileUpdateFields = {};
          if (file.fileName && file.fileName !== existingFile.name)
            fileUpdateFields.name = file.fileName;
          if (file.description && file.description !== existingFile.description)
            fileUpdateFields.description = file.description;

          if (Object.keys(fileUpdateFields).length === 0) return null; // Skip if no changes

          return {
            updateOne: {
              filter: { _id: file.fileId, postId },
              update: { $set: { ...fileUpdateFields, updatedAt: new Date() } },
            },
          };
        })
        .filter(Boolean); // Remove null values

      if (bulkUpdates.length > 0) {
        await FileFolder.bulkWrite(bulkUpdates);
      }
    }

    return { success: true, status: 200, message: "Post updated successfully" };
  } catch (error) {
    console.error("Update error:", error);
    return { success: false, status: 500, message: "Internal Server Error" };
  }
};
