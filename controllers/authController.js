import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createUser, findByUsername ,findByEmail} from "../models/userModel.js";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// Register a new user
export const register = async (req, res) => {
  try {
    const { username,email, password, role } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    const existing = await findByUsername(username);
    if (existing) {
      return res.status(409).json({ message: "Username already exists" });
    }
   const emailexisting = await findByEmail(email);
    if (emailexisting) {
      return res.status(409).json({ message: "Email already exists" });
    }
    const hashed = await bcrypt.hash(password, 10);
    const result = await createUser({ username,email, password: hashed, role: role || "admin" });

    res.status(201).json({ message: "User registered successfully", userId: result.insertId });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username & password required" });
    }
    const user = await findByUsername(username);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Compare password using bcrypt
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: { id: user.id, username: user.username, role: user.role }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: error.message });
  }
};
