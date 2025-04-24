"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = require("../models/db");
const zod_1 = require("zod");
const middlewares_1 = require("../middlewares");
const nanoid_1 = require("nanoid");
const router = express_1.default.Router();
const shareSchema = zod_1.z.object({
    share: zod_1.z.string(),
    originalContentId: zod_1.z.string()
});
router.post("/", middlewares_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const originalContent = yield db_1.ContentModel.findById(originalContentId);
        if (!originalContent) {
            res.status(404).json({ message: "Original content not found" });
            return;
        }
        const newSharedContent = yield db_1.ContentModel.create({
            userId,
            content: share,
            sharedFrom: originalContentId
        });
        // Generate unique hash
        const hash = (0, nanoid_1.nanoid)(10); // You can adjust length
        // Create a link entry
        const newLink = yield db_1.LinkModel.create({
            hash,
            userId,
            contentId: newSharedContent._id
        });
        res.status(201).json({
            message: "Content shared successfully",
            sharedContent: newSharedContent,
            shareableLink: `https://your-domain.com/share/${hash}`
        });
    }
    catch (error) {
        console.error("Error sharing content:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}));
router.delete("/:hash", middlewares_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const { hash } = req.params;
        if (!hash) {
            res.status(400).json({ message: "Hash not provided" });
            return;
        }
        // Find and delete the link by hash and userId
        const link = yield db_1.LinkModel.findOneAndDelete({ hash, userId });
        if (!link) {
            res.status(404).json({ message: "Link not found or unauthorized" });
            return;
        }
        res.json({ message: "Link deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting link:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}));
router.get("/:hash", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { hash } = req.params;
        const link = yield db_1.LinkModel.findOne({ hash })
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
    }
    catch (error) {
        console.error("Error fetching shared content:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}));
exports.default = router;
