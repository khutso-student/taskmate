import express from "express";
import {
  signup,
  login,
  updateProfile,
  updatePushToken,
  updateBio
} from "../controllers/userController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// AUTH
router.post('/signup', signup);
router.post('/login', login);

// PROFILE
router.put('/profile', protect, updateProfile);

// BIO (separate endpoint)
router.put('/bio', protect, updateBio);

// PUSH TOKEN
router.put('/push-token', protect, updatePushToken);

export default router;
