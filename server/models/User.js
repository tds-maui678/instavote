// server/models/User.js
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, index: true },
  name: { type: String, default: "" },
  passwordHash: { type: String, required: true }
}, { timestamps: true });

export const User = mongoose.model("User", UserSchema);