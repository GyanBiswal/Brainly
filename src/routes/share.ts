import express, { Request, Response } from "express";
import { ContentModel, LinkModel } from "../models/db";
import { z } from "zod";
import { userMiddleware } from "../middlewares";
import { nanoid } from "nanoid";

const router = express.Router();

const shareSchema = z.object({
  share: z.string(),
  originalContentId: z.string()
});

router.post("/", userMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const parseResult = shareSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ message: "Invalid request", errors: parseResult.error.errors });
      return;
    }

    const { share, originalContentId } = parseResult.data;

    const originalContent = await ContentModel.findById(originalContentId);
    if (!originalContent) {
      res.status(404).json({ message: "Original content not found" });
      return;
    }

    const newSharedContent = await ContentModel.create({
      userId,
      content: share,
      sharedFrom: originalContentId
    });

    // Generate unique hash
    const hash = nanoid(10); // You can adjust length

    // Create a link entry
    const newLink = await LinkModel.create({
      hash,
      userId,
      contentId: newSharedContent._id
    });

    res.status(201).json({
      message: "Content shared successfully",
      sharedContent: newSharedContent,
      shareableLink: `https://your-domain.com/share/${hash}`
    });
  } catch (error) {
    console.error("Error sharing content:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


router.delete("/:hash", userMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { hash } = req.params;

    if (!hash) {
      res.status(400).json({ message: "Hash not provided" });
      return;
    }

    // Find and delete the link by hash and userId
    const link = await LinkModel.findOneAndDelete({ hash, userId });

    if (!link) {
      res.status(404).json({ message: "Link not found or unauthorized" });
      return;
    }

    res.json({ message: "Link deleted successfully" });
  } catch (error) {
    console.error("Error deleting link:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


router.get("/:hash", async (req: Request, res: Response): Promise<void> => {
  try {
    const { hash } = req.params;

    const link = await LinkModel.findOne({ hash })
      .populate({
        path: "contentId",
        populate: {
          path: "userId", // this is the reference inside ContentModel
          select: "username email", // pick fields you want to show
        }
      });

    if (!link) {
      res.status(404).json({ message: "Shared link not found" });
      return;
    }

    res.status(200).json({
      sharedContent: link.contentId,
    });
  } catch (error) {
    console.error("Error fetching shared content:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});



export default router;
