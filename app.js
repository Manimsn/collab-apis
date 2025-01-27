import express from "express";
import dotenv from "dotenv";

import cookieParser from "cookie-parser"; // Import cookie-parser

import registerRoutes from "./routes/register.js"; // Use ESM import
import authRoutes from "./routes/auth.js"; // Use ESM import
import refreshRoutes from "./routes/refresh.js"; // Use ESM import
import errorHandler from "./middlewares/errorHandler.js"; // Use ESM import

dotenv.config(); // Load environment variables

const app = express();

// Add cookie-parser middleware
app.use(cookieParser());

// Middleware
app.use(express.json()); // Parse JSON request bodies

// Routes
app.use("/register", registerRoutes);
app.use("/auth", authRoutes);
app.use("/refresh", refreshRoutes);

// Global Error Handler
app.use(errorHandler);

export default app; // Default export for ESM
