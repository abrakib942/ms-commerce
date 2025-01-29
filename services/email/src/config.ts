import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.mailtrap.io",
  port: process.env.SMTP_PORT || 2525,
} as nodemailer.TransportOptions);

export const defaultSender = process.env.DEFAULT_SENDER_EMAIL || 'admin@example.com'