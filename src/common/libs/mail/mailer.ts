import ejs from "ejs";
import nodemailer from "nodemailer";
import path from "path";

import {
  EMAIL_SMTP_HOST,
  EMAIL_SMTP_PASS,
  EMAIL_SMTP_PORT,
  EMAIL_SMTP_SECURE,
  EMAIL_SMTP_SERIVCE_NAME,
  EMAIL_SMTP_USER,
} from "../../utils/env";

const transporter = nodemailer.createTransport({
  service: EMAIL_SMTP_SERIVCE_NAME,
  host: EMAIL_SMTP_HOST,
  port: EMAIL_SMTP_PORT,
  secure: EMAIL_SMTP_SECURE,
  auth: {
    user: EMAIL_SMTP_USER,
    pass: EMAIL_SMTP_PASS,
  },
  requireTLS: true,
});

interface ISendMail {
  from: string;
  to: string;
  subject: string;
  html: string;
}

export const sendMail = async (props: ISendMail) => {
  return transporter.sendMail(props);
};

export const renderMail = async (template: string, data: any) => {
  const content = await ejs.renderFile(path.join(__dirname, `templates/${template}.ejs`), data);
  return content as string;
};
