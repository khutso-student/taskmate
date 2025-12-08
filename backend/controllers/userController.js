import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

// ============================
//  SIGNUP
// ============================
export const signup = async (req, res) => {
  try {
    console.log("Signup body:", req.body); 
    const { username, email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashed,
    });

    const token = jwt.sign(
     { id: user._id, username: user.username, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Signup Error:", error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// ============================
//  LOGIN
// ============================
export const login = async (req, res) => {
  try {
    console.log("Login body:", req.body); 
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "User does not exist" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ message: "Incorrect password" });

    const token = jwt.sign(
      { id: user._id, username: user.username, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login Error:", error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// ============================
//  UPDATE PROFILE
//  (safe fields only)
// ============================
export const updateProfile = async (req, res) => {
  try {
    const allowedUpdates = ["username", "email", "bio"];
    const updates = {};

    for (let key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true }
    ).select("-password");

    res.status(200).json({ message: "Profile updated", user });
  } catch (error) {
    res.status(500).json({ message: "Failed to update profile" });
  }
};

// ============================
//  UPDATE PUSH TOKEN
// ============================
export const updatePushToken = async (req, res) => {
  try {
    const { expoPushToken } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { expoPushToken },
      { new: true }
    );

    res.status(200).json({ message: "Push token updated", user });
  } catch (error) {
    res.status(500).json({ message: "Failed to update push token" });
  }
};

// ============================
//  UPDATE BIO
// (optional separate route)
// ============================
export const updateBio = async (req, res) => {
  try {
    const { bio } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { bio },
      { new: true }
    ).select("-password");

    res.status(200).json({ message: "Bio updated", user });
  } catch (error) {
    res.status(500).json({ message: "Failed to update bio" });
  }
};
