import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// --- Mongo connection ---
const { MONGO_URI, PORT = 3000 } = process.env;

if (!MONGO_URI) {
  console.error("❌ Missing MONGO_URI in backend/.env");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

// --- User schema ---
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

// --- Scan schema ---
const scanSchema = new mongoose.Schema(
  {
    barcode: { type: String, required: true },
    source: { type: String, enum: ["openfoodfacts", "openbeautyfacts"], required: true },
    name: { type: String },
    co2e: { type: Number }, // estimated CO2e
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Scan = mongoose.model("Scan", scanSchema);

// --- Routes ---
app.get("/", (req, res) => {
  res.json({ ok: true, service: "carbonquest-backend" });
});

// --- Auth Routes ---

// Sign Up
app.post("/auth/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // Return user without password
    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Server error during signup" });
  }
});

// Sign In
app.post("/auth/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Return user without password
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
    });
  } catch (err) {
    console.error("Signin error:", err);
    res.status(500).json({ error: "Server error during signin" });
  }
});

// Create a scan (POST /scans)
app.post("/scans", async (req, res) => {
  try {
    const scan = await Scan.create(req.body);
    res.status(201).json(scan);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// List scans (GET /scans)
app.get("/scans", async (req, res) => {
  try {
    const scans = await Scan.find().sort({ createdAt: -1 }).limit(50);
    res.json(scans);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get scan by id (GET /scans/:id)
app.get("/scans/:id", async (req, res) => {
  try {
    const scan = await Scan.findById(req.params.id);
    if (!scan) return res.status(404).json({ error: "Not found" });
    res.json(scan);
  } catch (err) {
    res.status(400).json({ error: "Invalid id" });
  }
});

// Delete scan (DELETE /scans/:id)
app.delete("/scans/:id", async (req, res) => {
  try {
    const deleted = await Scan.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: "Invalid id" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 API running on http://localhost:${PORT}`);
});
