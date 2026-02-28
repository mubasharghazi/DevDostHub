// -----------------------------------------------
// config/db.js — MongoDB Connection using Mongoose
// -----------------------------------------------
// This file handles the database connection.
// We use Mongoose to connect to MongoDB and export
// the connection function so server.js can call it.
// -----------------------------------------------

const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Attempt to connect to MongoDB using the URI from .env
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // If connection fails, log the error and stop the server
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1); // Exit with failure code
  }
};

module.exports = connectDB;