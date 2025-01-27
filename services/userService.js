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
