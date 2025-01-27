import express from "express";
import dotenv from "dotenv";
import registerRoutes from "./routes/register.js"; // Use ESM import
import authRoutes from "./routes/auth.js"; // Use ESM import
import errorHandler from "./middlewares/errorHandler.js"; // Use ESM import

dotenv.config(); // Load environment variables

const app = express();

// Middleware
app.use(express.json()); // Parse JSON request bodies

// Routes
app.use("/register", registerRoutes);
app.use("/auth", authRoutes);

// Global Error Handler
app.use(errorHandler);

export default app; // Default export for ESM
