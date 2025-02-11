import { z } from "zod";
import PostFolder from "../../models/postFolderModel.js";

/**
 * Zod schema to validate request body.
 * Ensures only one of `isBlocker` or `isFeed` is provided and is a boolean.
 */
export const updateStatusSchema = z
  .object({
    isBlocker: z.boolean().optional(),
    isFeed: z.boolean().optional(),
  })
  .refine(
    (data) => Object.keys(data).length === 1,
    "Only one field (isBlocker or isFeed) should be provided."
  );

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
