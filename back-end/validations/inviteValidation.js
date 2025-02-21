import { z } from "zod";
import { ADMINROLE, categoryEnum, NON_OWNER_ROLES, ROLES } from "../config/constants.js";
import { messages } from "../config/messages.js";

const categorySchema = z.enum(categoryEnum);

// Validation for sending an invite
export const inviteSchema = z
  .object({
    email: z.string().email(messages.INVITE.INVALID_EMAIL_FORMAT),
    role: z.enum(Object.values(NON_OWNER_ROLES)).optional(),
    category: categorySchema.optional(),
    fileOrFolderAccess: z
      .array(
        z.object({
          fileOrFolderId: z
            .string()
            .min(1, messages.INVITE.FILE_OR_FOLDER_REQUIRED),
          role: z.enum(Object.values(ROLES)),
        })
      )
      .optional(),
  })
  .refine((data) => !(data.fileOrFolderId && !data.category), {
    message: messages.INVITE.CATEGORY_REQUIRED_FOR_FILE_OR_FOLDER,
    path: ["category"],
  })
  .refine((data) => !(data.category && data.role === ADMINROLE.ADMIN), {
    message: messages.INVITE.ADMIN_NOT_ALLOWED("category"),
    path: ["role"],
  })
  .refine((data) => !(data.fileOrFolderId && data.role === ADMINROLE.ADMIN), {
    message: messages.INVITE.ADMIN_NOT_ALLOWED("file or folder"),
    path: ["role"],
  })
  .refine(
    (data) =>
      !(
        data.fileOrFolderAccess &&
        data.fileOrFolderAccess.some((f) => f.role === ADMINROLE.ADMIN)
      ),
    {
      message: messages.INVITE.ADMIN_NOT_ALLOWED("file or folder"),
      path: ["fileOrFolderAccess"],
    }
  );

// Validation for accepting an invite
export const acceptInviteSchema = z.object({
  token: z.string().uuid(messages.INVITE.INVALID_OR_EXPIRED),
});
