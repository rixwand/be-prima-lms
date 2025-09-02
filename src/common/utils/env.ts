import dotenv from "dotenv";

dotenv.config();

export const ACCESS_TTL_SEC = parseInt(process.env.ACCESS_TTL_SEC!);
export const REFRESH_TTL_SEC = parseInt(process.env.REFRESH_TTL_SEC!);
export const JWT_ACCESS_SECRET: string = process.env.JWT_ACCESS_SECRET!;
export const JWT_REFRESH_SECRET: string = process.env.JWT_REFRESH_SECRET!;
export const NODE_ENV: string = process.env.NODE_ENV || "development";

export const EMAIL_SMTP_SECURE: boolean = Boolean(process.env.EMAIL_SMTP_SECURE) || false;
export const EMAIL_SMTP_USER: string = process.env.EMAIL_SMTP_USER || "";
export const EMAIL_SMTP_PASS: string = process.env.EMAIL_SMTP_PASS || "";
export const EMAIL_SMTP_PORT: number = Number(process.env.EMAIL_SMTP_PORT) || 465;
export const EMAIL_SMTP_HOST: string = process.env.EMAIL_SMTP_HOST || "";
export const EMAIL_SMTP_SERIVCE_NAME: string = process.env.EMAIL_SMTP_SERIVCE_NAME || "";

export const ACTIVATION_TOKEN_TTL_HOURS: string = process.env.ACTIVATION_TOKEN_TTL_HOURS || "24";

export const CLIENT_URL: string = process.env.CLIENT_URL || "";
