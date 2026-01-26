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
    scanCount: { type: Number, default: 0 },
    points: { type: Number, default: 0 },
    // Impact Garden state
    garden: {
      plants: [
        {
          id: String,
          stage: { type: Number, default: 0 }, // 0=seed, 1=sprout, 2=sapling, 3=young, 4=mature, 5=ancient
          growthPoints: { type: Number, default: 0 },
          plantedAt: { type: Date, default: Date.now },
        },
      ],
      animals: [String], // Array of unlocked animal emojis
      gardenLevel: { type: Number, default: 0 }, // 0=empty, 1=seedlings, 2=garden, 3=forest, 4=ecosystem
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

// --- Scan schema ---
const scanSchema = new mongoose.Schema(
  {
    barcode: { type: String, required: true },
    source: { type: String },
    name: { type: String, required: true },
    brand: { type: String },
    co2e: { type: Number }, // estimated CO2e in kg
    carbonRating: { type: String }, // A-F rating
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
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

// Helper: Calculate growth points based on carbon rating
function getGrowthPoints(carbonRating) {
  const growthMap = {
    A: 20,
    B: 15,
    C: 10,
    D: 7,
    E: 5,
    F: 3,
  };
  return growthMap[carbonRating?.toUpperCase()] || 10;
}

// Helper: Calculate plant stage based on growth points
function getPlantStage(growthPoints) {
  if (growthPoints >= 400) return 5; // Ancient Tree
  if (growthPoints >= 200) return 4; // Mature Tree
  if (growthPoints >= 100) return 3; // Young Tree
  if (growthPoints >= 50) return 2; // Sapling
  if (growthPoints >= 20) return 1; // Sprout
  return 0; // Seed
}

// Helper: Get unlockable animals based on total plants
function getUnlockedAnimals(plantCount) {
  const animals = [];
  if (plantCount >= 5) animals.push("🦋");
  if (plantCount >= 10) animals.push("🐦");
  if (plantCount >= 20) animals.push("🐰");
  if (plantCount >= 30) animals.push("🐿️");
  if (plantCount >= 50) animals.push("🦌");
  if (plantCount >= 75) animals.push("🦊");
  if (plantCount >= 100) animals.push("🐻");
  return animals;
}

// Helper: Calculate garden level based on plants
function getGardenLevel(plants) {
  const matureTrees = plants.filter((p) => p.stage >= 4).length;
  const youngTrees = plants.filter((p) => p.stage >= 3).length;
  const saplings = plants.filter((p) => p.stage >= 2).length;

  if (matureTrees >= 20) return 4; // Ecosystem
  if (youngTrees >= 15) return 3; // Forest
  if (saplings >= 10) return 2; // Garden
  if (plants.length >= 3) return 1; // Seedlings
  return 0; // Empty
}

// Create a scan for a user (POST /scans)
app.post("/scans", async (req, res) => {
  try {
    console.log("📥 Received scan request:", req.body);
    const { userId, barcode, name, brand, co2e, carbonRating, source } = req.body;

    if (!userId || !barcode || !name) {
      console.error("❌ Missing required fields:", { userId, barcode, name });
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Create the scan
    console.log("💾 Creating scan for user:", userId);
    const scan = await Scan.create({
      userId,
      barcode,
      name,
      brand,
      co2e,
      carbonRating,
      source,
    });
    console.log("✅ Scan created:", scan._id);

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      console.error("❌ User not found:", userId);
      return res.status(404).json({ error: "User not found" });
    }

    // Initialize garden if needed
    if (!user.garden) {
      user.garden = { plants: [], animals: [], gardenLevel: 0 };
    }

    // Calculate growth points based on carbon rating
    const growthPoints = getGrowthPoints(carbonRating);
    console.log("🌱 Growth points for rating", carbonRating, ":", growthPoints);

    // Plant a new seed
    const newPlant = {
      id: scan._id.toString(),
      stage: 0,
      growthPoints: growthPoints,
      plantedAt: new Date(),
    };
    newPlant.stage = getPlantStage(newPlant.growthPoints);
    user.garden.plants.push(newPlant);

    // Update existing plants with partial growth (older plants benefit too)
    const partialGrowth = Math.floor(growthPoints / 2);
    user.garden.plants.forEach((plant) => {
      if (plant.id !== newPlant.id) {
        plant.growthPoints += partialGrowth;
        plant.stage = getPlantStage(plant.growthPoints);
      }
    });

    // Update animals based on plant count
    const newAnimals = getUnlockedAnimals(user.garden.plants.length);
    user.garden.animals = newAnimals;

    // Update garden level
    user.garden.gardenLevel = getGardenLevel(user.garden.plants);

    // Update user's scan count and points
    const pointsEarned = 10;
    user.scanCount += 1;
    user.points += pointsEarned;

    await user.save();

    console.log("✅ User updated - Points:", user.points, "Scans:", user.scanCount);
    console.log("🌳 Garden updated - Plants:", user.garden.plants.length, "Level:", user.garden.gardenLevel);

    res.status(201).json({
      scan,
      pointsEarned,
      garden: {
        newPlant,
        totalPlants: user.garden.plants.length,
        newAnimals: newAnimals.filter((a) => !user.garden.animals.includes(a)),
        gardenLevel: user.garden.gardenLevel,
      },
    });
  } catch (err) {
    console.error("❌ Error saving scan:", err);
    res.status(400).json({ error: err.message });
  }
});

// Get user's scan history (GET /scans/user/:userId)
app.get("/scans/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const scans = await Scan.find({ userId })
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(scans);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user profile with stats (GET /users/:userId)
app.get("/users/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List all scans (GET /scans) - for admin purposes
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
