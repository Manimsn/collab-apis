// seeds/seedCategoryLevelAccess.js
import Project from "../models/Project.js";
import User from "../models/User.js";
import UserProjectMapping from "../models/UserProjectMapping.js";

export const seedCategoryLevelAccess = async () => {
  // Check if category-level access has already been seeded
  const existingCategoryAccess = await UserProjectMapping.findOne({
    categoryAccess: { $exists: true, $ne: [] },
  });

  if (existingCategoryAccess) {
    console.log(
      "🚀 UserProjectMapping Category level already seeded. Skipping..."
    );
    return;
  }

  const projects = await Project.find();

  for (const project of projects) {
    // Fetch project owner
    // const projectOwner = await User.findOne({ email: project.ownerEmail });

    // Fetch all users who are not project-level users
    const allUsers = await User.find({ email: { $ne: project.ownerEmail } });

    // Get users who are not already assigned in UserProjectMapping
    const assignedUsers = await UserProjectMapping.find({
      projectId: project._id,
    }).select("email");
    const assignedEmails = assignedUsers.map((user) => user.email);

    const eligibleUsers = allUsers.filter(
      (user) => !assignedEmails.includes(user.email)
    );

    // Select 5-10 random users for category-level access
    const categoryUsers = eligibleUsers.slice(
      0,
      Math.floor(Math.random() * 6) + 5
    );

    // Prepare category access records
    const newCategoryAccessRecords = categoryUsers.map((user) => ({
      email: user.email,
      projectId: project._id,
      createdBy: project.createdBy,
      categoryAccess: [
        { category: "Images", role: "VIEWER" },
        { category: "Drawings", role: "EDITOR" },
      ],
    }));

    // Insert new category access records
    await UserProjectMapping.insertMany(newCategoryAccessRecords);
  }

  console.log("✅ Category-level access seeded successfully.");
};
