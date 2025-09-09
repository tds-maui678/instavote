import "dotenv/config";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcrypt";
import crypto from "crypto";

import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

import { Poll } from "./models/Poll.js";
import { User } from "./models/User.js";
import { requireAuth, signJWT } from "./auth.js";

// ---- Cloudinary config ----
if (!process.env.CLOUDINARY_CLOUD_NAME) {
  console.error("[Cloudinary] Missing CLOUDINARY_* env vars");
}
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
  api_key: process.env.CLOUDINARY_API_KEY || "",
  api_secret: process.env.CLOUDINARY_API_SECRET || ""
});

// Store original file type in a generic "instavote" folder
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (_req, file) => ({
    folder: "instavote",
    resource_type: "auto",
    public_id: `poll_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    format: undefined 
  })
});
const upload = multer({ storage });

// ---- utils ----
function genCode(len = 6) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}
const genAdminKey = () => crypto.randomBytes(16).toString("hex");

// ---- app / server / io ----
const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_ORIGIN, credentials: true }));
app.use(requireAuth);

// health
app.get("/health", (_req, res) => res.json({ ok: true }));

// ---- Upload (Cloudinary) ----
app.post("/api/upload", upload.single("file"), (req, res) => {
  try {
    // multer-storage-cloudinary provides file.path = Cloudinary URL
    if (!req.file?.path) return res.status(400).json({ error: "Upload failed" });
    res.json({ url: req.file.path });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ---- AUTH ----
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, name, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: "Email & password required" });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: "Email already registered" });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, name: name || "", passwordHash });
    const token = signJWT({ id: user._id, email: user.email, name: user.name });
    res.json({ token, user: { id: user._id, email: user.email, name: user.name } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.passwordHash)))
      return res.status(400).json({ error: "Invalid credentials" });
    const token = signJWT({ id: user._id, email: user.email, name: user.name });
    res.json({ token, user: { id: user._id, email: user.email, name: user.name } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/me/polls", async (req, res) => {
  if (!req.user?.id) return res.status(401).json({ error: "Auth required" });
  const polls = await Poll.find({ ownerId: req.user.id }).sort({ createdAt: -1 });
  res.json(polls);
});

// ---- POLLS ----
app.post("/api/polls", async (req, res) => {
  try {
    const { question, options, optionsImages } = req.body;
    if (!question || !Array.isArray(options) || options.length < 2)
      return res.status(400).json({ error: "Question and at least 2 options required" });

    let code;
    do { code = genCode(); } while (await Poll.findOne({ code }));

    const ownerId = req.user?.id || null;     // null for guest
    const adminKey = genAdminKey();

    const poll = await Poll.create({
      code,
      question,
      options: options.map((t, i) => ({
        text: t,
        imageUrl: optionsImages?.[i] || "",
      })),
      isActive: true,
      ownerId,
      adminKey,
    });

    const base = (process.env.CLIENT_ORIGIN || "http://localhost:5173").replace(/\/$/, "");
    const publicUrl = `${base}/poll/${code}`;
    const adminUrl  = `${base}/poll/${code}?admin=${adminKey}`;

    res.status(201).json({ ...poll.toObject(), publicUrl, adminUrl, isOwner: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/polls/:code", async (req, res) => {
  const { code } = req.params;
  const adminKey = req.query.admin || "";
  const viewerId = req.user?.id || (req.headers["x-anon-id"] || "");

  const poll = await Poll.findOne({ code });
  if (!poll) return res.status(404).json({ error: "Not found" });

  const isOwner = (req.user?.id && poll.ownerId?.toString() === req.user.id)
               || (adminKey && adminKey === poll.adminKey);

  const hasVoted = viewerId && poll.voters.includes(viewerId);

  const safe = poll.toObject();
  if (!hasVoted) safe.options = safe.options.map(o => ({ ...o, votes: 0 }));

  res.json({ ...safe, isOwner, hasVoted });
});

app.post("/api/polls/:code/vote", async (req, res) => {
  const { index } = req.body;
  const viewerId = req.user?.id || (req.headers["x-anon-id"] || "");
  const poll = await Poll.findOne({ code: req.params.code });
  if (!poll || !poll.isActive) return res.status(404).json({ error: "Poll closed/not found" });

  if (typeof index !== "number" || index < 0 || index >= poll.options.length)
    return res.status(400).json({ error: "Invalid option" });

  if (viewerId && poll.voters.includes(viewerId))
    return res.status(400).json({ error: "Already voted" });

  poll.options[index].votes += 1;
  if (viewerId) poll.voters.push(viewerId);
  await poll.save();

  io.to(poll.code).emit("poll:updated", poll);
  res.json({ ok: true });
});

// Close poll - only owner (JWT) or adminKey may close
app.post("/api/polls/:code/close", async (req, res) => {
  const { code } = req.params;
  const { admin } = req.body || {};
  const poll = await Poll.findOne({ code });
  if (!poll) return res.status(404).json({ error: "Not found" });

  const isOwner = (req.user?.id && poll.ownerId?.toString() === req.user.id);
  const isAdminKey = admin && admin === poll.adminKey;

  if (!isOwner && !isAdminKey) return res.status(403).json({ error: "Not allowed" });

  poll.isActive = false;
  await poll.save();

  io.to(code).emit("poll:updated", poll);
  res.json({ ok: true, poll });
});

// ---- start server + sockets ----
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_ORIGIN, methods: ["GET", "POST"] }
});

io.on("connection", (socket) => {
  socket.on("poll:join", (code) => {
    socket.join(code);
    socket.emit("joined", code);
  });

  // socket close kept for backward-compat; UI uses REST
  socket.on("poll:close", async ({ code, admin }) => {
    const poll = await Poll.findOne({ code });
    if (!poll) return;
    if (!(admin && admin === poll.adminKey)) return;
    poll.isActive = false;
    await poll.save();
    io.to(code).emit("poll:updated", poll);
  });
});

// ---- DB then listen ----
const PORT = process.env.PORT || 5000;

(async () => {
  try {
    if (!process.env.MONGO_URI) throw new Error("MONGO_URI missing in .env");
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000, tls: true });
    console.log("[DB] connected");
    server.listen(PORT, () => console.log(`Server on http://localhost:${PORT}`));
  } catch (err) {
    console.error("[Startup] error:", err.message);
    process.exit(1);
  }
})();