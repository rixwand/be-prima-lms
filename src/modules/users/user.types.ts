import { InferType } from "yup";
import { IUserRegister } from "../auth/auth.types";
import { updatePasswordSchema, updateUserSchema } from "./user.validation";

type EUserStatus = "NOT_VERIFIED" | "ACTIVE" | "DISABLED";

export interface IUserCreateEntity extends Omit<IUserRegister, "password"> {
  passwordHash: string;
  roleId: number;
}

export interface IUserGetEntity extends IUserCreateEntity {
  id: number;
  profilePict: string;
  passwordHash: string;
  roleId: number;
  status: EUserStatus;
}

export interface IUserUpdate extends InferType<typeof updateUserSchema> {}
export interface IPasswordUpdate extends InferType<typeof updatePasswordSchema> {}
