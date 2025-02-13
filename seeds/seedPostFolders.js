// seeds/seedPostFolders.js

import PostFolder from "../models/postFolderModel.js";
import Project from "../models/Project.js";
import User from "../models/User.js";
import UserProjectMapping from "../models/UserProjectMapping.js";

export const seedPostFolders = async () => {
  const existingPostFolder = await PostFolder.countDocuments();
  if (existingPostFolder > 0) return console.log("PostFolder already seeded.");

  const projects = await Project.find();
  for (const project of projects) {
    const teamMembers = await UserProjectMapping.find({
      projectId: project._id,
    }).select("email");
    const users = await User.find({
      email: { $in: teamMembers.map((m) => m.email) },
    });

    for (let i = 0; i < 5; i++) {
      const category = ["Drawings", "Images", "Videos"][
        Math.floor(Math.random() * 3)
      ];
      const post = new PostFolder({
        type: "POST",
        name: `${category} Concept ${i + 1}`,
        projectId: project._id,
        category,
        parentFolderId: null,
        createdBy: users[Math.floor(Math.random() * users.length)]._id,
        taggedUsers: users.map((user) => user.email),
      });
      await post.save();
    }
  }
  console.log("✅ Posts & Folders seeded.");
};
