// seeds/seedProjectLevelAccess.js
import UserProjectMapping from "../models/UserProjectMapping.js";
import User from "../models/User.js";
import Project from "../models/Project.js";

const plans = {
  FREE: { projectsCount: 2, teamMember: 2 },
  BASIC: { projectsCount: 5, teamMember: 5 },
  PREMIUM: { projectsCount: 10, teamMember: 10 },
};

export const seedProjectLevelAccess = async () => {
  const existingUserProjectMapping = await UserProjectMapping.countDocuments({
    role: { $exists: true, $ne: null },
  });
  if (existingUserProjectMapping > 0)
    return console.log("UserProjectMapping Project level already seeded.");

  const projects = await Project.find();

  for (const project of projects) {
    const owner = await User.findOne({ email: project.ownerEmail });
    if (!owner) continue;

    const planLimits = plans[owner.plan];
    const existingAccessCount = await UserProjectMapping.countDocuments({
      projectId: project._id,
      role: { $exists: true },
    });

    if (existingAccessCount >= planLimits.teamMember) continue;

    const users = await User.find({ email: { $ne: owner.email } }).limit(
      planLimits.teamMember
    );
    const projectAccess = users.map((user) => ({
      email: user.email,
      projectId: project._id,
      role: ["ADMIN", "EDITOR"][Math.floor(Math.random() * 2)],
      createdBy: owner._id,
    }));

    await UserProjectMapping.insertMany(projectAccess);
  }
  console.log("✅ Project-level access seeded.");
};
