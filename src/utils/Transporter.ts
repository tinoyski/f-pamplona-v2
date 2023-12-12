import { createTransport } from "nodemailer";

export function getTransporter() {
  return createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: true,
    auth: {
      user: process.env.ZOHOMAIL_EMAIL,
      pass: process.env.ZOHOMAIL_PASSWORD,
    },
  });
}
