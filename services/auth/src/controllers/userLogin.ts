import { Request, Response, NextFunction } from "express";
import prisma from "@/prisma";
import { UserLoginSchema } from "@/schemas";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { LoginAttempt } from "@prisma/client";

type LoginHistory = {
  userId: string;
  ipAddress: string | undefined;
  userAgent: string | undefined;
  attempt: LoginAttempt;
};

const createLoginHistory = async (info: LoginHistory) => {
  await prisma.loginHistory.create({
    data: {
      userId: info.userId,
      ipAddress: info.ipAddress,
      userAgent: info.userAgent,
      attempt: info.attempt,
    },
  });
};

const userLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const ipAddress = (req.headers["x-forwarded-for"] as string) || req.ip;
    const userAgent = req.headers["user-agent"] || "";

    const parsedBody = UserLoginSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({ errors: parsedBody.error });
    }

    const user = await prisma.user.findUnique({
      where: {
        email: parsedBody.data.email,
      },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const passwordMatch = await bcrypt.compare(
      parsedBody.data.password,
      user.password
    );
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
        })
      return res.status(400).json({ message: "User is not verified" });
    }

    // check the if the account is active
    if (user.status !== "ACTIVE") {
        await createLoginHistory({
            userId: user.id,
            ipAddress,
            userAgent,
            attempt: "FAILED",
        })
      return res
        .status(400)
        .json({
          message: `Your Account is ${user.status.toLocaleLowerCase()}`,
        });
    }


    // generate the jwt token
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "2h" }
    );

    await createLoginHistory({
        userId: user.id,
        ipAddress,
        userAgent,
        attempt: "SUCCESS",
    })

    return res.status(200).json({ accessToken });

  } catch (error) {
    next(error);
  }
};

export default userLogin;