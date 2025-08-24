import dotenv from "dotenv";
import ms from "ms";

dotenv.config();

export const ACCESS_TTL_SEC = parseInt(process.env.ACCESS_TTL_SEC!);
export const REFRESH_TTL_SEC = parseInt(process.env.REFRESH_TTL_SEC!);
export const JWT_ACCESS_SECRET: string = process.env.JWT_ACCESS_SECRET!;
export const JWT_REFRESH_SECRET: string = process.env.JWT_REFRESH_SECRET!;
export const NODE_ENV: string = process.env.NODE_ENV || "development";
