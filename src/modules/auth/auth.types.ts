import { InferType } from "yup";
import { loginSchema, registerSchema } from "./auth.validation";

export interface IUserRegister extends InferType<typeof registerSchema> {}
export interface IUserLogin extends InferType<typeof loginSchema> {}

export interface IActivationTokenCreate {
  userId: number;
  selector: string;
  validator: string;
  expiresAt: Date;
}

export interface ISendActivationMail {
  fullName: string;
  userId: number;
  email: string;
}
