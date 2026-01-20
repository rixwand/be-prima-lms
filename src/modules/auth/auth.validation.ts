import * as yup from "yup";
import { CLIENT_URL } from "../../common/utils/env";
export const registerSchema = yup
  .object({
    username: yup.string().required().max(256),
    fullName: yup.string().required().max(256),
    email: yup.string().email().required(),
    password: yup
      .string()
      .required()
      .min(8, "Password must be at least 8 characters long")
      .matches(/[0-9]/, "Password must contain at least one number"),
    profilePict: yup.string().optional().max(500).default(`${CLIENT_URL}/images/user.jpg`),
  })
  .noUnknown()
  .required();

export const loginSchema = yup
  .object({
    email: yup.string().email().required(),
    password: yup.string().required().min(8, "Password must be at least 8 characters long"),
  })
  .noUnknown()
  .required();

export const activationSchema = yup.object({ code: yup.string().required() }).noUnknown().required();
