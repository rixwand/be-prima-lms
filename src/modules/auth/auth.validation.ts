import yup, { object } from "yup";
export const registerSchema = object({
  username: yup.string().required().max(256),
  fullName: yup.string().required(),
  email: yup.string().email().required(),
  password: yup.string().required(),
});
