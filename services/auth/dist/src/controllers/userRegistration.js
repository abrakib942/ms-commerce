"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("@/prisma"));
const schemas_1 = require("@/schemas");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const config_1 = require("@/config");
const axios_1 = __importDefault(require("axios"));
const userRegistration = async (req, res, next) => {
    try {
        // validate the request body
        const parsedBody = schemas_1.UserCreateSchema.safeParse(req.body);
        if (!parsedBody.success) {
            return res.status(400).json({ errors: parsedBody.error });
        }
        // check if the user already exists
        const existingUser = await prisma_1.default.user.findUnique({
            where: {
                email: parsedBody.data.email,
            },
        });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }
        // hash the password
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(parsedBody.data.password, salt);
        // create the user
        const user = await prisma_1.default.user.create({
            data: {
                ...parsedBody.data,
                password: hashedPassword,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                status: true,
                verified: true,
            },
        });
        // create the user profile by calling the user service
        await axios_1.default.post(`${config_1.USER_SERVICE}/users`, {
            authUserId: user.id,
            email: user.email,
            name: user.name,
        });
        return res.status(201).json(user);
    }
    catch (error) {
        next(error);
    }
};
exports.default = userRegistration;
//# sourceMappingURL=userRegistration.js.map