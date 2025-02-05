import mongoose from "mongoose";
import UserProjectMapping from "../models/UserProjectMapping.js";
import {
  inviteSchema,
  acceptInviteSchema,
} from "../validations/inviteValidation.js";
import { v4 as uuidv4 } from "uuid";
import sendEmail from "../utils/sendEmail.js";
import Project from "../models/Project.js";
import { inviteStatus, planLimits, userRoles } from "../config/constants.js";
import { messages } from "../config/messages.js";
/**
 * Send an Invite
 */
export const sendInvite = async (req, res) => {
  const { projectId } = req.params;
  const { email, role } = req.body;
  const { userId, email: userEmail, plan } = req?.user; // Extract user details from token

  // Validate request
  const validation = inviteSchema.safeParse({ email, role });
  if (!validation.success) {
    return res.status(400).json({ error: validation.error.format() });
  }

  try {
    // Fetch project details to check owner
    const project = await Project.findById({ _id: projectId });

    if (!project) {
      // return res.status(404).json({ message: "Project not found." });
      return res.status(404).json({ message: messages.PROJECT.NOT_FOUND });
    }

    // 🔹 Validate if the logged-in user is the project owner
    if (userId !== project.createdBy.toString()) {
      // 🔹 If not the owner, check if the user is an ADMIN in UserProjectMapping
      // const adminEntry = await UserProjectMapping.findOne({
      //   projectId,
      //   email: req.user.email, // Match the logged-in user's email
      //   role: userRoles.ADMIN,
      // });

      // if (!adminEntry) {
      //   return res.status(403).json({
      //     message: "Only the project owner or an admin can invite members.",
      //   });
      // }
      return res.status(403).json({
        message: messages.PROJECT.INVITE_PERMISSION_ERROR,
      });
    }

    // 🔹 Check if the user has exceeded their project limit
    // const userProjectsCount = await Project.countDocuments({
    //   createdBy: userId,
    // });

    // if (userProjectsCount >= planLimits[plan].maxProjects) {
    //   return res.status(403).json({
    //     // message: `Your plan (${plan}) allows only ${planLimits[plan].maxProjects} projects.`,
    //     message: messages.PROJECT.MAX_PROJECTS_REACHED(
    //       plan,
    //       planLimits[plan].maxProjects
    //     ),
    //   });
    // }

    // 🔹 Check if the project has reached the max member limit
    const memberCount = await UserProjectMapping.countDocuments({ projectId });
    // console.log("memberCount", memberCount);

    if (memberCount >= planLimits[plan].maxMembersPerProject) {
      return res.status(403).json({
        message: messages.PROJECT.MAX_MEMBERS_REACHED(
          plan,
          planLimits[plan].maxMembersPerProject
        ),
      });
    }

    // 🔹 Prevent inviting the project owner
    if (project.ownerEmail === email) {
      return res.status(400).json({
        message: messages.PROJECT.INVITE_OWNER_ERROR,
      });
    }

    let invite = await UserProjectMapping.findOne({ projectId, email });
    if (invite) {
      if (invite.status === inviteStatus.ACCEPTED) {
        return res
          .status(400)
          .json({ message: messages.INVITE.ALREADY_MEMBER });
      }

      invite.inviteToken = uuidv4();
      invite.status = inviteStatus.INVITED;
      invite.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      invite.updatedAt = new Date();
    } else {
      invite = new UserProjectMapping({
        email,
        projectId,
        role,
        createdBy: userId,
        inviteToken: uuidv4(),
      });
    }

    await invite.save();

    const inviteLink = `https://your-app.com/invite?token=${invite.inviteToken}`;
    await sendEmail(
      email,
      "Project Invitation",
      `Click here to join: ${inviteLink}`
    );
    res.json({ message: messages.INVITE.SENT_SUCCESS, inviteLink });
  } catch (error) {
    console.log("projectId---------error", error);
    res.status(500).json({ error: error.message });
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

    // console.log("🔹 Searching for Invite:", {
    //   projectId: projectObjectId,
    //   email: email.trim(),
    // });

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
