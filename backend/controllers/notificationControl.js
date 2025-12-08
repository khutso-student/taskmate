// notificationControl.js
import Notification from "../models/Notification.js";
import { sendExpoPush } from "../utils/sendExpoPush.js"; // will create this next

// Get all notifications for logged-in user
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json(notifications);
  } catch (error) {
    console.error("GET NOTIFICATIONS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch notifications." });
  }
};

/**
 * Create a new notification (called from task controller)
 * This saves to DB and also attempts to send a push to the user's device.
 *
 * @param {{userId: string, type: string, message: string}} param0
 * @returns {Promise<Notification|null>}
 */
export const createNotification = async ({ userId, type = "info", message }) => {
  try {
    const notify = await Notification.create({
      userId,
      type,
      message,
    });

    // fire-and-forget sending of push (catch inside helper)
    try {
      await sendExpoPush({
        userId,
        title: type.toUpperCase(),
        body: message,
        data: { type, notificationId: notify._id.toString() },
      });
    } catch (pushErr) {
      console.error("Failed to send expo push for notification:", pushErr);
      // don't throw — we still want to return saved DB notification
    }

    return notify;
  } catch (error) {
    console.error("CREATE NOTIFICATION ERROR:", error);
    return null;
  }
};

// Delete single notification
export const deleteNotification = async (req, res) => {
  try {
    await Notification.deleteOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    res.status(200).json({ message: "Notification deleted" });
  } catch (error) {
    console.error("DELETE NOTIFICATION ERROR:", error);
    res.status(500).json({ message: "Failed to delete notification." });
  }
};

// Clear all notifications for logged-in user
export const clearNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ userId: req.user._id });

    res.status(200).json({ message: "All notifications cleared" });
  } catch (error) {
    console.error("CLEAR NOTIFICATIONS ERROR:", error);
    res.status(500).json({ message: "Failed to clear notifications." });
  }
};
