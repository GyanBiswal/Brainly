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
const router = express_1.default.Router();
const contentSchema = zod_1.z.object({
    title: zod_1.z.string().min(1),
    link: zod_1.z.string().url(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    userId: zod_1.z.string().min(1),
});
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validated = contentSchema.parse(req.body);
        const content = yield db_1.ContentModel.create({
            title: validated.title,
            link: validated.link,
            tags: validated.tags || [],
            userId: validated.userId,
        });
        res.status(201).json({
            message: "Content created successfully",
            content,
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({ message: error.errors[0].message });
        }
        else {
            console.error("Content creation error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
}));
exports.default = router;
