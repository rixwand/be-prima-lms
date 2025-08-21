import { InferType } from "yup";
import { registerSchema } from "../auth/auth.validation";

export interface ICreateUserDTO extends InferType<typeof registerSchema> {}
export interface IUserRepo extends Omit<ICreateUserDTO, "password"> {
  passwordHash: string;
}
