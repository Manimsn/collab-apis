import Project from "../../models/Project.js";
import User from "../../models/User.js";
import UserProjectMapping from "../../models/UserProjectMapping.js";

// GET all users (Only _id and email)
// export const getAllUsers = async (req, res) => {
//   try {
//     const users = await User.find({}, "_id email plan"); // Fetch only _id and email
//     res.status(200).json(users);
//   } catch (error) {
//     console.error("Error fetching users:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };

// GET all users with project count
export const getAllUsers = async (req, res) => {
  try {
    // Fetch all users
    const users = await User.find({}, "_id email plan");

    // Create an array of user IDs to fetch project counts efficiently
    const userIds = users.map((user) => user._id);

    // Fetch project counts for each user
    const projectCounts = await Project.aggregate([
      { $match: { createdBy: { $in: userIds } } },
      { $group: { _id: "$createdBy", count: { $sum: 1 } } },
    ]);

    // Convert projectCounts into a map for quick lookup
    const projectCountMap = {};
    projectCounts.forEach(({ _id, count }) => {
      projectCountMap[_id.toString()] = count;
    });

    // Add project count to each user
    const usersWithProjectCount = users.map((user) => ({
      _id: user._id,
      email: user.email,
      plan: user.plan,
      projectCount: projectCountMap[user._id.toString()] || 0, // Default to 0 if no projects
    }));

    res.status(200).json(usersWithProjectCount);
  } catch (error) {
    console.error("Error fetching users with project count:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getProjectDetails = async (req, res) => {
  try {
    const projects = await Project.find(); // Fetch all projects

    const results = await Promise.all(
      projects.map(async (project) => {
        const projectId = project._id;

        // Fetch all user mappings for the specific projectId
        const userMappings = await UserProjectMapping.find({ projectId });

        // Count users at different access levels
        const projectLevel = userMappings.filter((u) => u.role).length;
        const categoryLevel = userMappings.filter(
          (u) => u.categoryAccess.length > 0 && !u.role
        ).length;
        const fileLevel = userMappings.filter(
          (u) => u.fileOrFolderAccess.length > 0 && !u.role
        ).length;

        // Extract unique team member emails **associated with the projectId**
        const teamMembers = [...new Set(userMappings.map((u) => u.email))];

        // Extract unique createdBy IDs **associated with the projectId**
        const createdBy = [
          ...new Set(userMappings.map((u) => u.createdBy.toString())),
        ];

        return {
          projectId: projectId.toString(),
          projectLevel,
          categoryLevel,
          fileLevel,
          teamMembers,
          createdBy,
        };
      })
    );

    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching project access counts:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getUserMappingDetails = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Validate projectId format (if needed)
    if (!projectId || projectId.length !== 24) {
      return res.status(400).json({ message: "Invalid projectId" });
    }

    // Fetch all user mappings for the given projectId
    const userMappings = await UserProjectMapping.find({ projectId });

    if (!userMappings.length) {
      return res
        .status(404)
        .json({ message: "No user mappings found for this project" });
    }

    // Count users at different access levels
    const projectLevel = userMappings.filter((u) => u.role).length;
    const categoryLevel = userMappings.filter(
      (u) => u.categoryAccess.length > 0 && !u.role
    ).length;
    const fileLevel = userMappings.filter(
      (u) =>
        u.fileOrFolderAccess.length > 0 &&
        !u.role &&
        u.categoryAccess.length === 0
    ).length;

    res.status(200).json({
      teamMembers: userMappings.length,
      projectLevel,
      categoryLevel,
      fileLevel,
      data: userMappings,
    });
  } catch (error) {
    console.error("Error fetching user mappings:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteUserMappingDetails = async (req, res) => {
  try {
    // Delete documents where categoryAccess is empty and fileOrFolderAccess is not empty
    const deleteResult = await UserProjectMapping.deleteMany({
      categoryAccess: { $size: 0 }, // categoryAccess is empty
      fileOrFolderAccess: { $not: { $size: 0 } }, // fileOrFolderAccess is NOT empty
    });

    // Update documents where both categoryAccess and fileOrFolderAccess are NOT empty
    const updateResult = await UserProjectMapping.updateMany(
      {
        categoryAccess: { $not: { $size: 0 } }, // categoryAccess is NOT empty
        fileOrFolderAccess: { $not: { $size: 0 } }, // fileOrFolderAccess is NOT empty
      },
      {
        $set: { fileOrFolderAccess: [] }, // Set fileOrFolderAccess to an empty array
      }
    );

    res.status(200).json({
      message: "Cleanup completed",
      deletedCount: deleteResult.deletedCount,
      updatedCount: updateResult.modifiedCount,
    });
  } catch (error) {
    console.error("Error in cleanup process:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
