import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

import UserProjectMapping from "../../models/UserProjectMapping.js";
import Project from "../../models/Project.js";

import {
  inviteSchema,
  acceptInviteSchema,
} from "../../validations/inviteValidation.js";

import sendEmail from "../../utils/sendEmail.js";
import { inviteStatus, planLimits } from "../../config/constants.js";
import { messages } from "../../config/messages.js";
import {
  checkProjectExists,
  checkUserProjectAccess,
  countCategoryMembers,
  countProjectMembers,
} from "../../services/inviteService.js";

/**
 * Send an Invite
 */

export const sendInvite = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { email, category, role, fileOrFolderAccess } = req.body;
    const { userId, plan } = req.user;

    // Validate request payload
    const validation = inviteSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.format() });
    }

    // Fetch project and validate ownership
    const project = await checkProjectExists(projectId);
    if (!project) {
      return res.status(404).json({ message: messages.PROJECT.NOT_FOUND });
    }

    if (userId !== project.createdBy.toString()) {
      return res
        .status(403)
        .json({ message: messages.PROJECT.INVITE_PERMISSION_ERROR });
    }

    // Prevent owner from inviting themselves
    if (project.ownerEmail.toString() === email) {
      return res
        .status(400)
        .json({ message: messages.PROJECT.INVITE_OWNER_ERROR });
    }

    // Validate max members limit for project-level invite
    if (!category && !fileOrFolderAccess) {
      const totalProjectMembers = await countProjectMembers(projectId);
      if (totalProjectMembers >= planLimits[plan].maxMembersPerProject) {
        return res.status(403).json({
          message: messages.PROJECT.MAX_MEMBERS_REACHED(
            plan,
            planLimits[plan].maxMembersPerProject
          ),
        });
      }
    }

    // Validate max members limit for category-level invite
    if (category && !fileOrFolderAccess) {
      const totalCategoryMembers = await countCategoryMembers(
        projectId,
        category
      );
      if (
        totalCategoryMembers >= planLimits[plan].maxMembersPerProjectExternal
      ) {
        return res.status(403).json({
          message: messages.PROJECT.MAX_CATEGORY_MEMBERS_REACHED(
            plan,
            planLimits[plan].maxMembersPerProjectExternal
          ),
        });
      }
    }

    // Determine the type of access request
    const isProjectAccess = !category && !fileOrFolderAccess;
    const isCategoryAccess = category && !fileOrFolderAccess;
    const isFileOrFolderAccess = category && fileOrFolderAccess;

    // Check if user already has full project access
    const existingUser = await checkUserProjectAccess(projectId, email);

    if (existingUser?.role) {
      return res.status(400).json({ message: messages.INVITE.ALREADY_MEMBER });
    }

    // Check if user already has category-level access
    if (
      (isCategoryAccess || !isFileOrFolderAccess) &&
      existingUser?.categoryAccess?.some((c) => c.category === category)
    ) {
      return res
        .status(400)
        .json({ message: messages.INVITE.CATEGORY_ALREADY_HAS_ACCESS });
    }

    // Create or update the invite
    let invite = existingUser;

    let newFiles = [];
    let newFilesCount = 0;
    let alreadyExistsCount = 0;
    if (invite) {
      if (isProjectAccess && invite.status === inviteStatus.ACCEPTED) {
        return res
          .status(400)
          .json({ message: messages.INVITE.ALREADY_MEMBER });
      }

      if (isProjectAccess && invite.status === inviteStatus.INVITED) {
        return res
          .status(400)
          .json({ message: messages.INVITE.ALREADY_MEMBER });
      }

      invite.inviteToken = uuidv4();
      invite.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      invite.updatedAt = new Date();

      if (isCategoryAccess) {
        invite.categoryAccess.push({ category, role });
      }

      if (isFileOrFolderAccess) {
        let fileFolderAccess = invite.fileOrFolderAccess.find(
          (entry) => entry.category === category
        );

        if (!fileFolderAccess) {
          invite.fileOrFolderAccess.push({
            category,
            files: fileOrFolderAccess.map(({ fileOrFolderId, role }) => ({
              fileOrFolderId,
              role,
            })),
          });
          newFiles = fileOrFolderAccess;
        } else {
          fileOrFolderAccess.forEach(({ fileOrFolderId, role }) => {
            const alreadyExists = fileFolderAccess.files.some(
              (file) => file.fileOrFolderId.toString() === fileOrFolderId
            );

            if (!alreadyExists) {
              fileFolderAccess.files.push({ fileOrFolderId, role });
              newFiles.push({ fileOrFolderId, role });
              newFilesCount++;
            } else {
              alreadyExistsCount++;
            }
          });
        }

        if (newFiles.length === 0) {
          return res.status(400).json({
            message:
              messages.INVITE.ALREADY_HAS_FILE_OR_FOLDER_ACCESS(
                alreadyExistsCount
              ),
          });
        }
      }
    } else {
      invite = new UserProjectMapping({
        email,
        projectId,
        createdBy: userId,
        inviteToken: uuidv4(),
        status: "invited",
        ...(isCategoryAccess ? { categoryAccess: [{ category, role }] } : {}),
        ...(isFileOrFolderAccess
          ? {
              fileOrFolderAccess: [
                {
                  category,
                  files: fileOrFolderAccess.map(({ fileOrFolderId, role }) => ({
                    fileOrFolderId,
                    role,
                  })),
                },
              ],
            }
          : {}),
        ...(isProjectAccess ? { role } : {}),
      });
    }

    await invite.save();
    const inviteLink = `https://your-app.com/invite?token=${invite.inviteToken}`;
    await sendEmail(
      email,
      "Project Invitation",
      `Click here to join: ${inviteLink}`
    );

    if (alreadyExistsCount > 0 && newFilesCount > 0) {
      return res.status(200).json({
        message: messages.INVITE.SOME_FILES_OR_FOLDERS_GRANTED_ACCESS(
          alreadyExistsCount,
          newFilesCount
        ),
      });
    }

    return res.json({ message: messages.INVITE.SENT_SUCCESS, inviteLink });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Accept an Invite
 */
export const acceptInvite = async (req, res) => {
  const { token } = req.body;
  const userEmail = req?.user?.email;

  // Validate token
  const validation = acceptInviteSchema.safeParse({ token });

  if (!validation.success)
    return res.status(400).json({ error: validation.error.format() });

  try {
    const invite = await UserProjectMapping.findOne({ inviteToken: token });

    if (!invite || invite?.status !== inviteStatus.INVITED)
      return res
        .status(400)
        .json({ message: messages.INVITE.INVALID_OR_EXPIRED });

    // 🔹 Ensure the logged-in user's email matches the invited email
    if (invite.email !== userEmail) {
      return res.status(403).json({ message: messages.INVITE.UNAUTHORIZED });
    }

    invite.status = inviteStatus.ACCEPTED;
    invite.updatedAt = new Date();
    await invite.save();

    // res.json({ message: "You have successfully joined the project!" });
    res.json({ message: messages.INVITE.SUCCESSFULLY_JOINED });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Revoke an Invite
 */
export const revokeInvite = async (req, res) => {
  const { projectId } = req.params;
  const { email } = req.body;
  // ✅ Validate email existence before using .trim()
  if (!email || typeof email !== "string") {
    return res
      .status(400)
      .json({ message: "Invalid email format or missing email." });
  }

  try {
    // ✅ Check if projectId is a valid ObjectId before converting
    if (!mongoose.isValidObjectId(projectId)) {
      return res.status(400).json({ message: "Invalid projectId format." });
    }

    const projectObjectId = new mongoose.Types.ObjectId(projectId);

    const invite = await UserProjectMapping.findOne({
      projectId: projectObjectId,
      email: email.trim(),
    });

    if (!invite || invite.status !== inviteStatus.INVITED)
      return res
        .status(400)
        .json({ message: messages.INVITE.NOT_FOUND_OR_USED });

    invite.status = inviteStatus.REVOKED;
    invite.updatedAt = new Date();
    await invite.save();

    res.json({ message: messages.INVITE.REVOKED_SUCCESS });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
