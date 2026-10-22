
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173"
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to WorkBridge API!");
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "WorkBridge backend is running"
  });
});

app.use("/api/jobs", require("./routes/jobRoutes"));

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`WorkBridge server running on port ${PORT}`);
  });
};

startServer();
