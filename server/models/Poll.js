// server/models/Poll.js
import mongoose from "mongoose";

const OptionSchema = new mongoose.Schema({
  text: { type: String, required: true, trim: true },
  imageUrl: { type: String, default: "" },
  votes: { type: Number, default: 0 }
}, { _id: false });

const PollSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, index: true },
  question: { type: String, required: true },
  options: { type: [OptionSchema], validate: v => v.length >= 2 },
  isActive: { type: Boolean, default: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  adminKey: { type: String, required: true },
  voters: { type: [String], default: [] }
}, { timestamps: true });

export const Poll = mongoose.model("Poll", PollSchema);