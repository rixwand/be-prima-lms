import * as yup from "yup";

export const updateUserSchema = yup
  .object({
    profilePict: yup.string().optional(),
    fullName: yup.string().optional(),
  })
  .test(
    "at-least-one-field",
    "At least one field must be provided",
    value => value != null && Object.keys(value).length > 0
  );

export const updatePasswordSchema = yup.object({
  newPassword: yup
    .string()
    .required()
    .min(8, "Password must be at least 8 characters long")
    .matches(/[0-9]/, "Password must contain at least one number"),
  oldPassword: yup.string().required(),
});
