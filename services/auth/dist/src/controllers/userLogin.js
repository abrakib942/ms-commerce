"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("@/prisma"));
const schemas_1 = require("@/schemas");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const createLoginHistory = async (info) => {
    await prisma_1.default.loginHistory.create({
        data: {
            userId: info.userId,
            ipAddress: info.ipAddress,
            userAgent: info.userAgent,
            attempt: info.attempt,
        },
    });
};
const userLogin = async (req, res, next) => {
    try {
        const ipAddress = req.headers["x-forwarded-for"] || req.ip;
        const userAgent = req.headers["user-agent"] || "";
        const parsedBody = schemas_1.UserLoginSchema.safeParse(req.body);
        if (!parsedBody.success) {
            return res.status(400).json({ errors: parsedBody.error });
        }
        const user = await prisma_1.default.user.findUnique({
            where: {
                email: parsedBody.data.email,
            },
        });
        if (!user) {
            await createLoginHistory({
                userId: "unknown",
                ipAddress,
                userAgent,
                attempt: "FAILED",
            });
            return res.status(400).json({ message: "Invalid credentials" });
        }
        const passwordMatch = await bcryptjs_1.default.compare(parsedBody.data.password, user.password);
        if (!passwordMatch) {
            await createLoginHistory({
                userId: user.id,
                ipAddress,
                userAgent,
                attempt: "FAILED",
            });
            return res.status(400).json({ message: "Invalid credentials" });
        }
        // check if the user is verified
        if (!user.verified) {
            await createLoginHistory({
                userId: user.id,
                ipAddress,
                userAgent,
                attempt: "FAILED",
            });
            return res.status(400).json({ message: "User is not verified" });
        }
        // check the if the account is active
        if (user.status !== "ACTIVE") {
            await createLoginHistory({
                userId: user.id,
                ipAddress,
                userAgent,
                attempt: "FAILED",
            });
            return res
                .status(400)
                .json({
                message: `Your Account is ${user.status.toLocaleLowerCase()}`,
            });
        }
        // generate the jwt token
        const accessToken = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: "2h" });
        await createLoginHistory({
            userId: user.id,
            ipAddress,
            userAgent,
            attempt: "SUCCESS",
        });
        return res.status(200).json({ accessToken });
    }
    catch (error) {
        next(error);
    }
};
exports.default = userLogin;
//# sourceMappingURL=userLogin.js.map