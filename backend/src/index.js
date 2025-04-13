import express from "express";
import dotenv from "dotenv";
dotenv.config();

import { clerkMiddleware } from "@clerk/express";
import fileUpload from "express-fileupload";
import path from "path";
import fs from "fs";
import cors from "cors";
import { createServer } from "http";
import cron from "node-cron";
import { fileURLToPath } from "url";

import { connectDB } from "./lib/db.js";
import { initializeSocket } from "./lib/socket.js";

import userRoutes from "./routes/user.route.js";
import authRoutes from "./routes/auth.route.js";
import adminRoutes from "./routes/admin.route.js";
import songRoutes from "./routes/song.route.js";
import albumRoutes from "./routes/album.route.js";
import statRoutes from "./routes/stat.route.js";

// 📦 File Path Setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🚀 App Initialization
const app = express();
const PORT = process.env.PORT || 3000;

// 🔌 HTTP + Socket Setup
const httpServer = createServer(app);
initializeSocket(httpServer);

// 🔐 Middleware
app.use(
  cors({
    origin: [process.env.FRONTEND_URL, "http://localhost:5173"],
    credentials: true,
  })
);

app.use(express.json());
app.use(clerkMiddleware());

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: path.join(__dirname, "tmp"),
    createParentPath: true,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
    },
  })
);

// 🧹 Cron Job: Clean tmp folder every hour
const tempDir = path.join(__dirname, "tmp");
cron.schedule("0 * * * *", () => {
  if (fs.existsSync(tempDir)) {
    fs.readdir(tempDir, (err, files) => {
      if (err) {
        console.error("Cron Error:", err);
        return;
      }
      for (const file of files) {
        fs.unlink(path.join(tempDir, file), () => {});
      }
    });
  }
});

// 🧭 API Routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/songs", songRoutes);
app.use("/api/albums", albumRoutes);
app.use("/api/stats", statRoutes);

// 🖼️ Serve Frontend in Production (Vite build)
if (process.env.NODE_ENV === "production") {
  const frontendPath = path.join(__dirname, "../frontend/dist"); 
  app.use(express.static(frontendPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}

// ❌ Error Handler
app.use((err, req, res, next) => {
  console.error("Error Handler:", err.stack);
  res.status(500).json({
    message:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
  });
});

// 🔗 Connect to DB + Start Server
httpServer.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  connectDB();
});
