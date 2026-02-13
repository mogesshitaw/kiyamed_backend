// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

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

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
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

