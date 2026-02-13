// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import pool from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import newsRoutes from "./routes/newsRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import comentRoutes from "./routes/comentRoutes.js";
import applyRoutes from "./routes/applyRoutes.js";
import importantDatesRoutes from "./routes/importantDatesRoutes.js";

dotenv.config();
const app = express();

// For ES module __dirname simulation
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(cors());

// ✅ Remove duplicate express.json() call and set high limit
app.use(express.json());            // JSON body size limit
app.use(express.urlencoded({ limit: "50mb", extended: true })); // URL-encoded form data

// Serve static files from uploads folder
app.use("/uploads", express.static(path.join(__dirname
  , "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/feedback", comentRoutes);
app.use("/api/apply", applyRoutes);
app.use("/api/important-dates", importantDatesRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.send("Kiyamid College News Backend is running ✅");
});

app.get("/init-tables", async (req, res) => {
  try {
    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(50) UNIQUE,
        username VARCHAR(100) UNIQUE,
        password VARCHAR(255),
        role ENUM('admin','user') DEFAULT 'admin'
      )
    `);
// Categories table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL
      )
    `);
    // Categories table
    await pool.query(`
      insert into users(email,username,password,role) values('admin@gmial.com','admin','$2b$10$UlCvZVBkvwbPAArbx5CYdOnVNmVO0SZ2GFMwvCdDe51qLjvJMsUD6','admin'
    )
    `);

    // Image table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS image (
        id INT AUTO_INCREMENT PRIMARY KEY,
        image VARCHAR(255)
      )
    `);

    // News table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS news (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255),
        content LONGTEXT,
        image_id INT,
        category_id INT,
        author VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id),
        FOREIGN KEY (image_id) REFERENCES image(id)
      )
    `);

    // Feedback table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS feedback (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        message TEXT,
        allow_contact BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Applications table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS applications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        fullName VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        program VARCHAR(100) NOT NULL,
        education TEXT NOT NULL,
        experience TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Important Dates table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS important_dates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        intake_name VARCHAR(100) NOT NULL,
        event_name VARCHAR(255) NOT NULL,
        event_date DATE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    res.send("✅ All tables created successfully!");
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ Error creating tables: " + err.message);
  }
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://mysql.railway.internal:${PORT}`);
  console.log(`Press Ctrl+C to stop the server`);
});

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
  } else {
    console.error('❌ Server error:', error);
  }
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n👋 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n👋 SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

