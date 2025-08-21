import { UserRepo } from "../users/user.repository";
import { ICreateUserDTO } from "../users/user.types";
import bcrypt from "bcrypt";

const PEPPER = process.env.PASSWORD_PEPPER || "";

export const authServices = {
  async register({ password, ...user }: ICreateUserDTO) {
    const passwordHash = await bcrypt.hash(password + PEPPER, 12);
    const res = await UserRepo.create({ ...user, passwordHash });
    return res;
  },
};
