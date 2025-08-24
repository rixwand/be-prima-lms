import * as yup from "yup";
export const registerSchema = yup.object({
  username: yup.string().required().max(256),
  fullName: yup.string().required(),
  email: yup.string().email().required(),
  password: yup
    .string()
    .required()
    .min(8, "Password must be at least 8 characters long")
    .matches(/[0-9]/, "Password must contain at least one number"),
});

export const loginSchema = yup.object({
  email: yup.string().email().required(),
  password: yup
    .string()
    .required()
    .min(8, "Password must be at least 8 characters long"),
});
