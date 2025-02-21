// import mongoose from "mongoose";
// import User from "../../models/User.js"; // Import the User model
// import bcrypt from "bcrypt";

// // ✅ Predefined sample users
// export const users = {
//   manishUser: {
//     _id: new mongoose.Types.ObjectId(),
//     firstName: "John",
//     lastName: "Doe",
//     email: "owner@example.com",
//     passwordHash: bcrypt.hashSync("SecurePass123!", 10),
//     designation: "Project Owner",
//     location: "New York",
//     plan: "PREMIUM",
//     planType: "Yearly",
//     credits: 100,
//     totalCredits: 500,
//     balanceCredits: 400,
//   },

//   invitedUser: {
//     _id: new mongoose.Types.ObjectId(),
//     firstName: "Jane",
//     lastName: "Smith",
//     email: "invited@example.com",
//     passwordHash: bcrypt.hashSync("SecurePass123!", 10),
//     designation: "Guest User",
//     location: "Los Angeles",
//     plan: "BASIC",
//     planType: "Monthly",
//     credits: 50,
//     totalCredits: 200,
//     balanceCredits: 150,
//   },

//   adminUser: {
//     _id: new mongoose.Types.ObjectId(),
//     firstName: "Alice",
//     lastName: "Brown",
//     email: "admin@example.com",
//     passwordHash: bcrypt.hashSync("SecurePass123!", 10),
//     designation: "Administrator",
//     location: "Chicago",
//     plan: "PREMIUM",
//     planType: "Yearly",
//     credits: 300,
//     totalCredits: 1000,
//     balanceCredits: 700,
//   },

//   viewerUser: {
//     _id: new mongoose.Types.ObjectId(),
//     firstName: "Bob",
//     lastName: "Wilson",
//     email: "viewer@example.com",
//     passwordHash: bcrypt.hashSync("SecurePass123!", 10),
//     designation: "Viewer",
//     location: "San Francisco",
//     plan: "FREE",
//     planType: null,
//     credits: 10,
//     totalCredits: 50,
//     balanceCredits: 40,
//   },

//   editorUser: {
//     _id: new mongoose.Types.ObjectId(),
//     firstName: "Emily",
//     lastName: "Davis",
//     email: "editor@example.com",
//     passwordHash: bcrypt.hashSync("SecurePass123!", 10),
//     designation: "Content Editor",
//     location: "Seattle",
//     plan: "BASIC",
//     planType: "Monthly",
//     credits: 80,
//     totalCredits: 300,
//     balanceCredits: 220,
//   },
// };

// // ✅ Function to insert sample users into the test database
// export const insertUsers = async () => {
//   await User.insertMany(Object.values(users));
// };

// // ✅ Function to delete all users from the test database
// export const deleteUsers = async () => {
//   await User.deleteMany({});
// };
