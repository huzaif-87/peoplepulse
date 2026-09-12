const mongoose = require("mongoose");

const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI;
  const localFallbackUri = "mongodb://127.0.0.1:27017/peoplepulse";

  try {
    console.log("Mongo URI exists:", !!process.env.MONGO_URI);
    const connection = await mongoose.connect(primaryUri);
    console.log(`MongoDB connected: ${connection.connection.host}`);
  } catch (error) {
    console.warn("⚠️ MongoDB Atlas connection failed:", error.message);
    console.warn("👉 Common cause: Current IP address is not whitelisted in MongoDB Atlas Network Access.");
    console.warn("🔄 Attempting automatic fallback to local MongoDB (mongodb://127.0.0.1:27017/peoplepulse)...");

    try {
      const fallbackConnection = await mongoose.connect(localFallbackUri);
      console.log(`✅ Local MongoDB connected successfully: ${fallbackConnection.connection.host}`);
    } catch (fallbackError) {
      console.error("❌ Local MongoDB fallback failed:", fallbackError.message);
      console.error("Please add your IP address (or 0.0.0.0/0) to your MongoDB Atlas IP whitelist:");
      console.error("https://www.mongodb.com/docs/atlas/security-whitelist/");
      process.exit(1);
    }
  }
};

module.exports = connectDB;