// middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import { findById } from "../models/userModel.js";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export const authenticateToken = async (req, res, next) => {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    // attach user basic info to req
    req.user = { id: payload.id, username: payload.username, role: payload.role };
    // optionally refresh user data from DB
    const user = await findById(payload.id);
    if (!user) return res.status(401).json({ message: "Invalid token - user not found" });
    req.user = { ...req.user, role: user.role };
    next();
  } catch (err) {
    console.error("auth error", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const authorizeAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  if (req.user.role !== "admin") return res.status(403).json({ message: "Admin access required" });
  next();
};

// Alias for compatibility
export const verifyToken = authenticateToken;