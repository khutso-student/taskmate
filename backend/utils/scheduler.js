// utils/scheduler.js
import cron from "node-cron";
import Task from "../models/Task.js";
import { createNotification } from "../controllers/notificationControl.js";
import axios from "axios";

// Map labels to schema field names
const reminderFieldMap = {
  "1 day before": "reminderSent1dayBefore",
  "1 hour before": "reminderSent1hourBefore",
  "30 minutes before": "reminderSent30minutesBefore",
};

// Runs every minute
cron.schedule("* * * * *", async () => {
  try {
    const now = new Date();

    // Fetch tasks that have not been fully reminded yet
    const tasks = await Task.find({ reminderSent: false })
      .populate({
        path: "user",
        select: "expoPushToken notificationPreferences name email"
      });

    for (const task of tasks) {
      try {
        const user = task.user;
        if (!user || !user.expoPushToken) continue;

        const reminders = [];

        // Build reminders based on user preferences
        if (user.notificationPreferences?.dayBefore) {
          reminders.push({
            time: new Date(task.date.getTime() - 24 * 60 * 60 * 1000),
            label: "1 day before"
          });
        }
        if (user.notificationPreferences?.hourBefore) {
          reminders.push({
            time: new Date(task.date.getTime() - 60 * 60 * 1000),
            label: "1 hour before"
          });
        }
        if (user.notificationPreferences?.thirtyMinBefore) {
          reminders.push({
            time: new Date(task.date.getTime() - 30 * 60 * 1000),
            label: "30 minutes before"
          });
        }

        // Send reminders if the time has come and flag not yet set
        for (const reminder of reminders) {
          const field = reminderFieldMap[reminder.label];
          if (now >= reminder.time && !task[field]) {
            // Send push notification
            await axios.post("https://exp.host/--/api/v2/push/send", {
              to: user.expoPushToken,
              title: `⏰ Task Reminder (${reminder.label})`,
              body: `You have: ${task.name}`,
            });

            // Save notification in DB
            await createNotification({
              userId: user._id,
              type: "reminder",
              message: `Reminder: Task "${task.name}" (${reminder.label})`,
            });

            // Mark this specific reminder as sent
            task[field] = true;
          }
        }

        // Mark task as fully reminded if all active reminders are sent
        const activeFields = reminders.map(r => reminderFieldMap[r.label]);
        const allSent = activeFields.every(f => task[f] === true);
        if (allSent) task.reminderSent = true;

        await task.save();

      } catch (taskErr) {
        console.error(`Failed to send reminder for task ${task._id}:`, taskErr.message);
        if (task.user) {
          await createNotification({
            userId: task.user._id,
            type: "error",
            message: `Failed to send reminder for task "${task.name}": ${taskErr.message}`
          });
        }
      }
    }
  } catch (err) {
    console.error("Scheduler error:", err.message);
  }
});
