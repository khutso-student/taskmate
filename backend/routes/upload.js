import express from "express";
import multer from "multer";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Memory storage for buffer upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Upload profile image
router.post("/upload-profile", protect, upload.single("image"), async (req, res) => {
  try {
    const userId = req.user._id;

    if (!req.file) {
      return res.status(400).json({ error: "No image file uploaded" });
    }

    const base64Image = req.file.buffer.toString("base64");
    const mimeType = req.file.mimetype;
    const profileImage = `data:${mimeType};base64,${base64Image}`;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profileImage },
      { new: true }
    ).select("-password");

    res.status(200).json({
      message: "Profile image uploaded successfully",
      user: updatedUser,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to upload profile image" });
  }
});

export default router;
