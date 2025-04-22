"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Ensure JWT_SECRET is defined
const JWT_SECRET = process.env.JWT_SECRET_KEY;
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET_KEY is not defined in the environment variables.");
}
const userMiddleware = (req, res, next) => {
    const header = req.headers["authorization"];
    // Check if the Authorization header exists
    if (!header) {
        res.status(403).json({ message: "Authorization header missing" });
        return; // We return here because we have already sent a response
    }
    const token = header.split(" ")[1]; // Assuming format: "Bearer <token>"
    // If no token in the header
    if (!token) {
        res.status(403).json({ message: "Token missing" });
        return; // We return here because we have already sent a response
    }
    try {
        // Verify the token and extract the payload
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        /*
          Type Safety for decoded: Since jwt.verify returns a decoded payload, which can vary based on the structure of your JWT, it’s a good practice to define an interface for the decoded payload to ensure type safety.
        */
        // Attach the userId to the request
        req.userId = decoded.id;
        // Continue to the next middleware or route handler
        next();
    }
    catch (error) {
        res.status(403).json({ message: "Invalid token or unauthorized access" });
        return; // We return here because we have already sent a response
    }
};
exports.userMiddleware = userMiddleware;
