import prisma from "@/prisma";
import {Response, Request, NextFunction } from "express";

const getEmails = async (req: Request, res: Response, next:NextFunction): Promise<any> => {
    try {
        const emails = await prisma.email.findMany();
        return res.status(200).json({ emails });
    } catch (error) {
        next(error);
    }
}

export default getEmails;