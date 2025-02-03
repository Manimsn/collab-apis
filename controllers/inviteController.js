import mongoose from "mongoose";
import UserProjectMapping from "../models/UserProjectMapping.js";
import {
  inviteSchema,
  acceptInviteSchema,
} from "../validations/inviteValidation.js";
import { v4 as uuidv4 } from "uuid";
import sendEmail from "../utils/sendEmail.js";

/**
 * Send an Invite
 */
export const sendInvite = async (req, res) => {
  const { projectId } = req.params;
  const { email, role } = req.body;
  const createdBy = req?.user?.userId; // Assuming authentication middleware
  console.log("createdBy", createdBy);
  // Validate request
  const validation = inviteSchema.safeParse({ email, role });
  if (!validation.success) {
    return res.status(400).json({ error: validation.error.format() });
  }

  try {
    let invite = await UserProjectMapping.findOne({ projectId, email });

    if (invite) {
      if (invite.status === "accepted") {
        return res
          .status(400)
          .json({ message: "User is already a project member." });
      }

      invite.inviteToken = uuidv4();
      invite.status = "invited";
      invite.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      invite.updatedAt = new Date();
    } else {
      invite = new UserProjectMapping({
        email,
        projectId,
        role,
        createdBy,
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

    res.json({ message: "Invitation sent successfully!", inviteLink });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Accept an Invite
 */
export const acceptInvite = async (req, res) => {
  const { token } = req.body;

  // Validate token
  const validation = acceptInviteSchema.safeParse({ token });
  if (!validation.success)
    return res.status(400).json({ error: validation.error.format() });

  try {
    const invite = await UserProjectMapping.findOne({ inviteToken: token });
    console.log(invite);

    if (!invite || invite.status !== "invited")
      return res.status(400).json({ message: "Invalid or expired invite." });

    invite.status = "accepted";
    invite.updatedAt = new Date();
    await invite.save();

    res.json({ message: "You have successfully joined the project!" });
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

    console.log("🔹 Searching for Invite:", {
      projectId: projectObjectId,
      email: email.trim(),
    });

    const invite = await UserProjectMapping.findOne({
      projectId: projectObjectId,
      email: email.trim(),
    });
    console.log("invite", invite);

    if (!invite || invite.status !== "invited")
      return res
        .status(400)
        .json({ message: "Invite not found or already used." });

    invite.status = "revoked";
    invite.updatedAt = new Date();
    await invite.save();

    res.json({ message: "Invitation revoked successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
