import express from "express";
import mongoose from "mongoose";
import authRoutes from "./routes/auth";
import contentRoutes from "./routes/content";
import shareRoutes from "./routes/share"

import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());


app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/content", contentRoutes);
app.use("/api/v1/share", shareRoutes);

async function main() {
  try {
    await mongoose.connect(process.env.MONGO_URL!);
    app.listen(3000, () => {
      console.log("🚀 Server running on http://localhost:3000");
    });
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
  }
}

main();