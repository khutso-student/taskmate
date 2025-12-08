import express from "express";
import { getNotifications, deleteNotification, clearNotifications } from "../controllers/notificationControl.js";
import { protect } from "../middleware/auth.js"; // your auth middleware

const router = express.Router();

// Get all notifications for the authenticated user
router.get("/", protect, getNotifications);

// Delete a single notification (frontend only)
router.delete("/:id", protect, deleteNotification);

// Clear all notifications (frontend only)
router.delete("/", protect, clearNotifications);

export default router;
