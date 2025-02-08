import express from "express";
import dotenv from "dotenv";

import cookieParser from "cookie-parser"; // Import cookie-parser

import registerRoutes from "./routes/register.js"; // Use ESM import
import authRoutes from "./routes/auth.js"; // Use ESM import
import refreshRoutes from "./routes/refresh.js"; // Use ESM import
import logoutRoutes from "./routes/logout.js"; // Use ESM import
import resetPasswordRoutes from "./routes/reset-password.js"; // Use ESM import

import projectRoutes from "./routes/projects.js"; // Use ESM import
import fileRoutes from "./routes/fileFolderRoutes.js"; // Use ESM import
import errorHandler from "./middlewares/errorHandler.js"; // Use ESM import
import verifyAccessToken from "./middlewares/authMiddleware.js"; // Use ESM import

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
app.use("/logout", logoutRoutes);
app.use("/resetpassword", resetPasswordRoutes);

app.use(verifyAccessToken);
app.use("/projects", projectRoutes);
app.use("/post", fileRoutes);

// Global Error Handler
app.use(errorHandler);

export default app; // Default export for ESM
