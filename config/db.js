const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Accessing the variable via process.env
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected via Environment Variables");
  } catch (err) {
    console.error("❌ MongoDB Connection Failed:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
