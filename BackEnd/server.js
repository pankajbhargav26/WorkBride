
const express = require("express");
const cors = require("cors");
const path = require("node:path");
require("dotenv").config({
  path: path.resolve(__dirname, ".env"),
  override: false,
});

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const diagnosisRoutes = require("./routes/diagnosisRoutes");

const app = express();
const frontendOrigins = process.env.FRONTEND_URL
  ? [process.env.FRONTEND_URL]
  : ["http://localhost:5173", "http://127.0.0.1:5173"];

app.use(cors({
  origin: frontendOrigins
}));

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/diagnosis", diagnosisRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to WorkBridge API!");
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "WorkBridge backend is running"
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`WorkBridge server running on port ${PORT}`);
  });
};

startServer();
