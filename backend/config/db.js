import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const uri =
      process.env.NODE_ENV === "production"
        ? process.env.MONGO_URI
        : process.env.MONGO_URI_LOCAL; // local dev DB

    if (!uri) {
      throw new Error("MongoDB URI is missing.");
    }

    // Mongoose v8+ connects without extra options
    await mongoose.connect(uri);

    console.log(
      `✅ MongoDB connected successfully to ${process.env.NODE_ENV} database`
    );
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;
