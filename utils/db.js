import mongoose from "mongoose";
import { seedDatabase } from "../seeds/seedDatabase.js";


const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");
    // 🔹 Call the seed function after successful DB connection
    await seedDatabase();
    console.log("Database seeding completed!");
  } catch (err) {
    console.error("Database connection error:", err);
    process.exit(1); // Exit on failure
  }
};

export default connectDB;
