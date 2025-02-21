import UserProjectMapping from "../models/UserProjectMapping.js";
import User from "../models/User.js";
import PostFolder from "../models/postFolderModel.js";
import Project from "../models/Project.js";

export const updateUserProjectMappingsForFiles = async () => {
  // Check if fileOrFolderAccess has already been seeded
  const existingFileAccess = await UserProjectMapping.findOne({
    fileOrFolderAccess: { $exists: true, $ne: [] },
  });
  if (existingFileAccess) {
    console.log("🚀 File/Folder access already seeded. Skipping...");
    return;
  }

  const projects = await Project.find();
  for (const project of projects) {
    // Fetch project owner and team members
    const projectOwner = await User.findOne({ email: project.ownerEmail });
    const allUsers = await UserProjectMapping.find({ projectId: project._id });

    // Users who do not have project-level access
    const eligibleUsers = allUsers.filter((u) => !u.role);

    // Exclude project owner from being assigned access
    const filteredUsers = eligibleUsers.filter(
      (user) => user.email !== projectOwner.email
    );

    // Fetch all posts and folders under this project
    const posts = await PostFolder.find({ projectId: project._id });

    for (const post of posts) {
      for (const user of filteredUsers) {
        // Ensure the user is only given access to posts/folders in categories they were not assigned to
        const hasCategoryAccess = user.categoryAccess?.some(
          (access) => access.category === post.category
        );
        if (hasCategoryAccess) continue;

        // Find existing user project mapping
        const userMapping = await UserProjectMapping.findOne({
          email: user.email,
          projectId: post.projectId,
        });

        if (userMapping) {
          // Check if category already exists in fileOrFolderAccess
          const existingCategory = userMapping.fileOrFolderAccess.find(
            (entry) => entry.category === post.category
          );

          if (existingCategory) {
            // Append the file to the existing category
            existingCategory.files.push({
              fileOrFolderId: post._id,
              role: "EDITOR",
            });
          } else {
            // Add a new category with the file
            userMapping.fileOrFolderAccess.push({
              category: post.category,
              files: [{ fileOrFolderId: post._id, role: "EDITOR" }],
            });
          }

          // Save the updated document
          await userMapping.save();
        } else {
          // Create new user mapping entry
          await UserProjectMapping.create({
            email: user.email,
            projectId: post.projectId,
            createdBy: projectOwner._id,
            fileOrFolderAccess: [
              {
                category: post.category,
                files: [{ fileOrFolderId: post._id, role: "EDITOR" }],
              },
            ],
          });
        }
      }
    }
  }

  console.log("✅ File/Folder access updated successfully.");
};
