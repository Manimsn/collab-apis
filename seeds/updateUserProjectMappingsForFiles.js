// seeds/updateUserProjectMappingsForFiles.js
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
    // const projectLevelUsers = allUsers.filter((u) => u.role); // Users with project-level access
    // const categoryLevelUsers = allUsers.filter(
    //   (u) => u.categoryAccess && u.categoryAccess.length > 0
    // );
    const eligibleUsers = allUsers.filter((u) => !u.role); // Users who don't have project-level access

    // Exclude project owners
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

        await UserProjectMapping.findOneAndUpdate(
          { email: user.email, projectId: post.projectId },
          {
            $setOnInsert: {
              email: user.email,
              projectId: post.projectId,
              createdBy: projectOwner._id,
            },
            $addToSet: {
              fileOrFolderAccess: {
                category: post.category,
                files: [{ fileOrFolderId: post._id, role: "EDITOR" }],
              },
            },
          },
          { upsert: true, new: true }
        );
      }
    }
  }
  console.log("✅ File/Folder access updated successfully.");
};
