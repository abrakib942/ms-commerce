import { Request, Response, NextFunction } from "express";
import prisma from "@/prisma";
import { UserCreateSchema } from "@/schemas";
import bcrypt from "bcryptjs";
import { EMAIL_SERVICE, USER_SERVICE } from "@/config";
import axios from "axios";

const generateVerificationCode = () => {
  // Get current timestamp in milliseconds
  const timestamp = new Date().getTime().toString();

  // Generate a random 2-digit number
  const randomNum = Math.floor(10 + Math.random() * 90); // Ensures 2-digit random number

  // Combine timestamp and random number and extract last 5 digits
  let code = (timestamp + randomNum).slice(-5);

  return code; //
};

const userRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    // validate the request body
    const parsedBody = UserCreateSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({ errors: parsedBody.error });
    }

    // check if the user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email: parsedBody.data.email,
      },
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(parsedBody.data.password, salt);

    // create the user
    const user = await prisma.user.create({
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
    await axios.post(`${USER_SERVICE}/users`, {
      authUserId: user.id,
      email: user.email,
      name: user.name,
    });

    // verification code
    const code = generateVerificationCode();
    await prisma.verificationCode.create({
      data: {
        userId: user.id,
        code,
        expiredAt: new Date(new Date().getTime() + 1 * 60 * 60 * 1000), // 1 hour
      },
    });

    // send verification email
    await axios.post(`${EMAIL_SERVICE}/emails/send`, {
      recipient: user.email,
      subject: "Account Verification",
      body: `Your verification code is ${code}`,
      source: "user-registration",
    }
    )

    return res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

export default userRegistration;
