"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBody = void 0;
// utils/validate.ts
const zod_1 = require("zod");
const validateBody = (schema, body) => {
    try {
        schema.parse(body);
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            throw new Error(error.errors[0].message);
        }
        throw error;
    }
};
exports.validateBody = validateBody;
