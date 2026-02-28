// -----------------------------------------------
// server.js — Entry Point for the Application
// -----------------------------------------------
// This is the main file that:
//   1. Loads environment variables from .env
//   2. Connects to MongoDB
//   3. Sets up Express middleware
//   4. Mounts the API routes
//   5. Starts the server
// -----------------------------------------------

// Load environment variables FIRST (before anything else)
const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// Import route files
const userRoutes = require("./routes/userRoutes");
const eventRoutes = require("./routes/eventRoutes");
const rsvpRoutes = require("./routes/rsvpRoutes");
const aiRoutes = require("./routes/aiRoutes");

// Serverless wrapper for AWS Lambda deployment
const serverless = require("serverless-http");

// -----------------------------------------------
// Initialize Express App
// -----------------------------------------------
const app = express();

// -----------------------------------------------
// Middleware
// -----------------------------------------------
// cors()          → Allows requests from other origins (e.g., React frontend)
// express.json()  → Parses incoming JSON request bodies
// -----------------------------------------------
app.use(cors());
app.use(express.json());

// -----------------------------------------------
// Health-check Route (GET /)
// -----------------------------------------------
// Quick way to verify the server is running.
// -----------------------------------------------
app.get("/", (req, res) => {
  res.json({ message: "🚀 DevDostHub API is running!" });
});

// -----------------------------------------------
// Mount API Routes
// -----------------------------------------------
// All user routes   → /api/users
// All event routes  → /api/events
// All RSVP routes   → /api/rsvps
// -----------------------------------------------
app.use("/api/users", userRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/rsvps", rsvpRoutes);
app.use("/api/ai", aiRoutes);

// -----------------------------------------------
// Start Server & Connect to Database
// -----------------------------------------------
const PORT = process.env.PORT || 5000;

// -----------------------------------------------
// Local Development vs AWS Lambda
// -----------------------------------------------
// When running locally (node server.js), start the server normally.
// When deployed to AWS Lambda, export the serverless handler instead.
// -----------------------------------------------
if (process.env.AWS_LAMBDA_FUNCTION_NAME) {
  // Running on AWS Lambda — connect to DB on cold start, export handler
  let isConnected = false;
  const handler = serverless(app);
  module.exports.handler = async (event, context) => {
    context.callbackWaitsForEmptyEventLoops = false;
    if (!isConnected) {
      await connectDB();
      isConnected = true;
    }
    return handler(event, context);
  };
} else {
  // Running locally — connect to MongoDB first, then start listening
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  });
}
