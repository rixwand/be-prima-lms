import { IUserRegister } from "../auth/auth.types";

type EUserStatus = "NOT_VERIFIED" | "ACTIVE" | "DISABLED";

export interface IUserCreateEntity extends Omit<IUserRegister, "password"> {
  passwordHash: string;
}

export interface IUserGetEntity extends IUserCreateEntity {
  id: number;
  profilePict: string;
  passwordHash: string;
  status: EUserStatus;
}
