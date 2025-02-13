import Project from "../../models/Project.js";
import User from "../../models/User.js";

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
