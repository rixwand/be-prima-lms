import * as yup from "yup";

export const updateUserSchema = yup
  .object({
    profilePict: yup.string().optional().max(500),
    fullName: yup.string().optional().max(256),
  })
  .test(
    "at-least-one-field",
    "At least one field must be provided",
    value => value != null && Object.keys(value).length > 0
  )
  .required()
  .noUnknown();

export const updatePasswordSchema = yup
  .object({
    newPassword: yup
      .string()
      .required()
      .min(8, "Password must be at least 8 characters long")
      .matches(/[0-9]/, "Password must contain at least one number"),
    oldPassword: yup.string().required(),
  })
  .noUnknown()
  .required();
