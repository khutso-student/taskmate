import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  const auth = req.headers.authorization;

  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = auth.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch full user document (important!)
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ message: "User no longer exists" });

    req.user = user; // Now contains full user object

    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};
