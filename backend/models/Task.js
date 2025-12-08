import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String },

  // Tracks whether any reminder was sent (final flag)
  reminderSent: { type: Boolean, default: false },

  // Per-reminder flags to prevent duplicate notifications
  reminderSent1dayBefore: { type: Boolean, default: false },
  reminderSent1hourBefore: { type: Boolean, default: false },
  reminderSent30minutesBefore: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model("Task", taskSchema);
