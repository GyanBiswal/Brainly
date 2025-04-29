"use strict";
// import { NextFunction, Request, Response } from 'express';
// import jwt from 'jsonwebtoken';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET_KEY;
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET_KEY is not defined in environment variables.");
}
const userMiddleware = (req, res, next) => {
    const header = req.headers["authorization"];
    // Log the JWT_SECRET_KEY and the Authorization header
    console.log("JWT_SECRET_KEY from env:", JWT_SECRET);
    console.log("Authorization header:", header);
    // Check if the Authorization header exists
    if (!header) {
        res.status(403).json({ message: "Authorization header missing" });
        return;
    }
    const token = header.split(" ")[1]; // Assuming format: "Bearer <token>"
    // If no token in the header
    if (!token) {
        res.status(403).json({ message: "Token missing" });
        return;
    }
    try {
        // Verify the token and extract the payload
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        // Attach the userId to the request
        req.userId = decoded.id;
        // Continue to the next middleware or route handler
        next();
    }
    catch (error) {
        console.error("Error verifying token:", error);
        res.status(403).json({ message: "Invalid token or unauthorized access" });
        return; // We return here because we have already sent a response
    }
};
exports.userMiddleware = userMiddleware;
