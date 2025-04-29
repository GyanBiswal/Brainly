import express, { Request, Response } from "express";
import { ContentModel } from "../models/db";
import { z } from "zod";
import { userMiddleware } from "../middlewares";

const router = express.Router();

const contentSchema = z.object({
  title: z.string().min(1),
  link: z.string().url(),
  tags: z.array(z.string()).optional(),
  type: z.enum(["youtube", "twitter", "documents", "links"]),
});

router.post("/", userMiddleware, async (req: Request, res: Response) => {
  try {
    const validated = contentSchema.parse(req.body);
    const content = await ContentModel.create({
      title: validated.title,
      link: validated.link,
      tags: validated.tags || [],
      type: validated.type,
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
router.get("/", userMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    // Make sure userId exists on req.userId
    const userId = req.userId;
    if (!userId) {
      res.status(400).json({ message: "User not authenticated" });
      return;
    }

    // Query the ContentModel to fetch content for the current user
    const content = await ContentModel.find({
      userId: userId
    }).populate("userId", "username"); // Assuming userId is a reference to a User model

    // Return the content with the populated user details
    res.json({
      content
    });
  } catch (error) {
    console.error("Error fetching content:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


router.delete("/:id", userMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    // Ensure userId exists on req.userId
    const userId = req.userId;
    if (!userId) {
      res.status(400).json({ message: "User not authenticated" });
      return;
    }

    // Extract the content ID from the request parameters
    const { id } = req.params;

    // Find and delete the content that matches the ID and belongs to the current user
    const deletedContent = await ContentModel.findOneAndDelete({
      _id: id,
      userId: userId, // Ensures the content belongs to the current authenticated user
    });

    // Check if content was found and deleted
    if (!deletedContent) {
      res.status(404).json({ message: "Content not found or you don't have permission to delete it" });
      return;
    }

    // Respond with a success message
    res.status(200).json({
      success: true,
      message: "Content deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting content:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


export default router;
