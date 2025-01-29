"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.accessTokenSchema = exports.UserLoginSchema = exports.UserCreateSchema = void 0;
const zod_1 = require("zod");
exports.UserCreateSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6).max(100),
    name: zod_1.z.string().min(3).max(100),
});
exports.UserLoginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6).max(100),
});
exports.accessTokenSchema = zod_1.z.object({
    accessToken: zod_1.z.string(),
});
//# sourceMappingURL=schemas.js.map