import bcrypt from "bcrypt";

const PEPPER = process.env.PASSWORD_PEPPER || "";

export const hashPassword = async (password: string) => {
  return bcrypt.hash(password + PEPPER, 12);
};

export const comparePassword = (password: string, hashedPassword: string) => {
  return bcrypt.compare(password + PEPPER, hashedPassword);
};
