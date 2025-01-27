import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  designation: { type: String },
  location: { type: String },
  plan: { type: String, enum: ["FREE", "BASIC", "PREMIUM"], required: true },
  planType: { type: String, enum: ["Monthly", "Yearly"], default: null }, // Allow null values
  credits: { type: Number, default: 0 },
  totalCredits: { type: Number, default: 0 },
  balanceCredits: { type: Number, default: 0 },
  downloadedModels: { type: [Object], default: [] },
  refreshTokens: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", UserSchema);

export default User; // Use ESM export
