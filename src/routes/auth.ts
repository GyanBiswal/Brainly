import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/db"; 
import { z } from "zod";
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET_KEY; 

// Zod schema for validation
const signupSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters long"),
  password: z.string().min(6, "Password must be at least 6 characters long")
});

const signinSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters long"),
  password: z.string().min(6, "Password must be at least 6 characters long")
});


// Signup Route 
router.post("/signup", async (req: Request, res: Response): Promise<void>  => {
  try {
    // Validate request body with Zod
    signupSchema.parse(req.body);

    const { username, password } = req.body;

    const existingUser = await UserModel.findOne({ username });
    if (existingUser) {
      res.status(409).json({ message: "Username already taken." });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10); 

    const user = await UserModel.create({
      username,
      password: hashedPassword,
    });

    res.status(201).json({ 
      message: 'User created successfully',
      user: {
        username: user.username,
        id: user._id
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Zod validation errors
      res.status(400).json({ message: error.errors[0].message });
    } else {
      // Other errors (DB, internal, etc.)
      console.error("Error creating user:", error);
      res.status(500).json({ message: 'Error creating user' });
    }
  }
});

// Signin Route 
router.post("/signin", async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body with Zod
    signinSchema.parse(req.body);

    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ message: "Username and password are required." });
      return;
    }

    const user = await UserModel.findOne({ username });
    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    const isPasswordValid = user.password ? await bcrypt.compare(password, user.password) : false;
    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid credentials." });
      return;
    }

    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET_KEY is not defined in the environment variables.");
    }

    const token = jwt.sign(
      { id: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: "1h" } 
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        username: user.username,
        id: user._id,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Zod validation errors
      res.status(400).json({ message: error.errors[0].message });
    } else {
      // Other errors (DB, internal, etc.)
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  }
});
export default router;