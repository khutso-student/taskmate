import express from "express";
import dotenv from "dotenv";
import path from "path";
import cors from "cors";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import uploadRoutes from "./routes/upload.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import { fileURLToPath } from "url";
import "./utils/scheduler.js";

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load correct env file (local vs production)
const envFile = process.env.NODE_ENV === "production" ? ".env" : ".env.local";
dotenv.config({ path: path.resolve(__dirname, envFile) });

// Connect to DB
connectDB();

// Create Express App
const app = express();

// CORS
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow mobile apps (Expo)
      if (!origin) return callback(null, true);

      // Allow LAN devices
      if (origin.startsWith("http://192.168.")) return callback(null, true);

      // Allow localhost (React Native Web + Tools)
      if (origin.includes("localhost")) return callback(null, true);

      return callback(new Error(`❌ CORS blocked: ${origin}`));
    },
    credentials: true,
  })
);

app.use(express.json());

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/notifications", notificationRoutes);

// SERVER START
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(
    `🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode`
  );
});
