import { Request, Response, NextFunction } from "express";
import prisma from "@/prisma";
import { EmailCreateSchema } from "@/schemas";
import { defaultSender, transporter } from "@/config";

const sentEmail = async( req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    // validate the request body
    const parsedBody = EmailCreateSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({ errors: parsedBody.error });
    }

    // create mail option
    const { recipient, subject, body, source, sender } = parsedBody.data;
    const from = sender || defaultSender;
    const mailOptions = {
      from: from,
      to: recipient,
      subject,
      text: body,
      html: body,
    };

    // send email
    const { rejected} = await transporter.sendMail(mailOptions);
    if (rejected.length) {
        console.log('Email rejected', rejected);
      return res.status(400).json({ message: "Failed" });
    }

    await prisma.email.create({
        data: {
            recipient,
            subject,
            body,
            source,
            sender: from,
        }
    })

    return res.status(200).json({ message: "Email sent" });

  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
}

export default sentEmail;