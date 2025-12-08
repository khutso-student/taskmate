// utils/sendExpoPush.js
import axios from "axios";
import User from "../models/User.js";

export const sendExpoPush = async ({ userId, title, body, data }) => {
  try {
    const user = await User.findById(userId);

    if (!user || !user.expoPushToken) {
      console.log("User has no Expo Push Token");
      return;
    }

    const message = {
      to: user.expoPushToken,
      sound: "default",
      title,
      body,
      data,
      priority: "high",
    };

    // Expo requires an ARRAY of messages
    const response = await axios.post(
      "https://exp.host/--/api/v2/push/send",
      [message],
      {
        headers: {
          Accept: "application/json",
          "Accept-Encoding": "gzip, deflate",
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Expo push sent:", response.data);
  } catch (error) {
    console.error("Expo push error:", error.response?.data || error.message);
  }
};
