import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    bio: { type: String },
    profileImage: { type: String, default: "" },
    notificationPreferences: {
    dayBefore: { type: Boolean, default: false },
    hourBefore: { type: Boolean, default: false },
    thirtyMinBefore: { type: Boolean, default: false }
    },
    expoPushToken: { type: String, default: "" }


}, { timestamps: true }
);

export default  mongoose.model('User', userSchema);