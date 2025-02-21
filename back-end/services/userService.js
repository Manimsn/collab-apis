import bcrypt from "bcrypt";
import User from "../models/User.js"; // Use ESM import

const UserService = {
  async isEmailDuplicate(email) {
    return User.findOne({ email }).exec();
  },

  async createUser(userData) {
    const {
      firstName,
      lastName,
      email,
      password,
      plan,
      planType,
      designation,
      location,
    } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);

    return User.create({
      firstName,
      lastName,
      email,
      passwordHash: hashedPassword,
      plan,
      planType: planType,
      designation: designation || null,
      location: location || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  },
};

export default UserService; // Use ESM export

/**
 * Finds a user based on a dynamic query.
 * @param {Object} query - The query object to search for the user.
 * @returns {Promise<Object|null>} - Returns the user object if found, otherwise null.
 */
export const findUser = async (query) => {
  return await User.findOne(query).exec();
};
