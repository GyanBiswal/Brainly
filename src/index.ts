import express from "express";
import mongoose from "mongoose";
import authRoutes from "./routes/auth";
import contentRoutes from "./routes/content";
import shareRoutes from "./routes/share"
import cors from "cors"; 

import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());

app.use(cors({
  origin: 'http://localhost:5173',  // Allow only your frontend's URL
  methods: 'GET,POST,PUT,DELETE',  // Allowed HTTP methods
  allowedHeaders: 'Content-Type,Authorization'  // Allow specific headers (optional)
}));


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