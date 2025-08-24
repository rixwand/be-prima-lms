import { InferType } from "yup";
import { loginSchema, registerSchema } from "./auth.validation";

export interface IUserRegister extends InferType<typeof registerSchema> {}
export interface IUserLogin extends InferType<typeof loginSchema> {}
