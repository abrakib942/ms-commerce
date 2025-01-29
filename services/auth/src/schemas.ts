import e from "express";
import { z } from "zod";

export const UserCreateSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(100),
  name: z.string().min(3).max(100),
});

export const UserLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(100),
});

export const accessTokenSchema = z.object({
    accessToken: z.string(),
})

export const EmailVerificationSchema = z.object({
  email: z.string().email(),
  code: z.string().length(5),
});