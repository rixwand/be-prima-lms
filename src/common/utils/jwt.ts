import { CookieOptions } from "express";
import jwt from "jsonwebtoken";
import { ACCESS_TTL_SEC, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, NODE_ENV, REFRESH_TTL_SEC } from "./env";
export type JwtPayload = {
  sub: number;
  jti: string;
  type: "access" | "refresh";
};

type Ok = [JwtPayload, null];
type Err = [null, Error];
type Result = Ok | Err;

export const newJti = () => crypto.randomUUID();

export const signAccessToken = (sub: number, jti: string) => {
  return jwt.sign({ sub, jti, type: "access" } as JwtPayload, JWT_ACCESS_SECRET, { expiresIn: ACCESS_TTL_SEC });
};

export const signRefreshToken = (sub: number, jti: string) => {
  return jwt.sign({ sub, jti, type: "refresh" } as JwtPayload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TTL_SEC });
};
export const verifyAccessToken = (token: string): Result => {
  try {
    const res = jwt.verify(token, JWT_ACCESS_SECRET);
    return [res as unknown as JwtPayload, null];
  } catch (error: any) {
    return [null, error];
  }
};

export const verifyRefreshToken = (token: string): Result => {
  try {
    const res = jwt.verify(token, JWT_REFRESH_SECRET);
    return [res as unknown as JwtPayload, null];
  } catch (error: any) {
    return [null, error];
  }
};

export const refreshCookieName = "rtc";

export const cookieOpt: CookieOptions = {
  secure: true,
  httpOnly: NODE_ENV == "production" ? true : false,
  sameSite: "strict" as const,
  path: "/api/auth/refresh",
  maxAge: REFRESH_TTL_SEC * 1000,
};
