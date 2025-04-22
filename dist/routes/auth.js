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
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../models/db");
const zod_1 = require("zod");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const router = express_1.default.Router();
const JWT_SECRET = process.env.JWT_SECRET_KEY;
// Zod schema for validation
const signupSchema = zod_1.z.object({
    username: zod_1.z.string().min(3, "Username must be at least 3 characters long"),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters long")
});
const signinSchema = zod_1.z.object({
    username: zod_1.z.string().min(3, "Username must be at least 3 characters long"),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters long")
});
// Signup Route 
router.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validate request body with Zod
        signupSchema.parse(req.body);
        const { username, password } = req.body;
        const existingUser = yield db_1.UserModel.findOne({ username });
        if (existingUser) {
            res.status(409).json({ message: "Username already taken." });
            return;
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const user = yield db_1.UserModel.create({
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
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            // Zod validation errors
            res.status(400).json({ message: error.errors[0].message });
        }
        else {
            // Other errors (DB, internal, etc.)
            console.error("Error creating user:", error);
            res.status(500).json({ message: 'Error creating user' });
        }
    }
}));
// Signin Route 
router.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validate request body with Zod
        signinSchema.parse(req.body);
        const { username, password } = req.body;
        if (!username || !password) {
            res.status(400).json({ message: "Username and password are required." });
            return;
        }
        const user = yield db_1.UserModel.findOne({ username });
        if (!user) {
            res.status(404).json({ message: "User not found." });
            return;
        }
        const isPasswordValid = user.password ? yield bcrypt_1.default.compare(password, user.password) : false;
        if (!isPasswordValid) {
            res.status(401).json({ message: "Invalid credentials." });
            return;
        }
        if (!JWT_SECRET) {
            throw new Error("JWT_SECRET_KEY is not defined in the environment variables.");
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: "1h" });
        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                username: user.username,
                id: user._id,
            },
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            // Zod validation errors
            res.status(400).json({ message: error.errors[0].message });
        }
        else {
            // Other errors (DB, internal, etc.)
            console.error("Login error:", error);
            res.status(500).json({ message: "Internal server error." });
        }
    }
}));
exports.default = router;
