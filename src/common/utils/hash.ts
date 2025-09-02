import bcrypt from "bcrypt";
import crypto from "node:crypto";

const PEPPER = process.env.PASSWORD_PEPPER || "";

export const hashPassword = async (password: string) => {
  return bcrypt.hash(password + PEPPER, 12);
};

export const comparePassword = (password: string, hashedPassword: string) => {
  return bcrypt.compare(password + PEPPER, hashedPassword);
};

export const sha256 = (s: string) => crypto.createHash("sha256").update(s, "utf-8").digest("hex");

export const randHex = (bytes = 32) => crypto.randomBytes(bytes).toString("hex");
