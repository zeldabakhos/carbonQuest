const express = require("express");
const app = express();
const port = 4000;

require("dotenv").config();
const connectDB = require("./utils/db.js");
const path = require("path");

const userRoutes = require("./routes/users");

// Connect to DBs
connectDB();

// MIDDLEWARE
app.use(express.json());

// --- CORS MIDDLEWARE ---
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  next();
});
app.options("*", (req, res) => {
  res.sendStatus(200);
});

// Extra middleware
app.use((req, res, next) => {
  req.requestTime = Date.now();
  req.arithmetical_value = 4 * 7;
  next();
});

// ROUTES
app.use("/api/users", userRoutes);

// Root & static
app.get("/", (req, res) => {
  res.send("Welcome to CarbonQuest!");
});
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});
