import express, { Request, Response } from "express";
import { ContentModel } from "../models/db";
import { z } from "zod";
import { userMiddleware } from "../middlewares";

const router = express.Router();

const contentSchema = z.object({
  title: z.string().min(1),
  link: z.string().url(),
  tags: z.array(z.string()).optional(),
});

router.post("/", userMiddleware, async (req: Request, res: Response) => {
  try {
    const validated = contentSchema.parse(req.body);
    const content = await ContentModel.create({
      title: validated.title,
      link: validated.link,
      tags: validated.tags || [],
      userId: req.userId,
    });

    res.status(201).json({
      message: "Content created successfully",
      content,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: error.errors[0].message });
    } else {
      console.error("Content creation error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
});

export default router;
