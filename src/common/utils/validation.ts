import * as yup from "yup";
import { formatYupError } from "./error";
import { ApiError } from "./http";

export const validate = async <T>(schema: yup.Schema<T>, data: any): Promise<yup.InferType<typeof schema>> => {
  try {
    console.log(JSON.stringify(data));
    const res = await schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });
    return res;
  } catch (error) {
    const err = error as yup.ValidationError;
    console.log(typeof error);
    const message = formatYupError(err);
    throw new ApiError(400, JSON.stringify(message));
  }
};

export const validateIdParams = async (id: any) =>
  validate(
    yup.object({
      id: yup.number().positive().integer().required(),
    }),
    { id }
  );

export const validateSlugParams = async (slug: any) =>
  validate(
    yup.object({
      slug: yup
        .string()
        .required("Slug is required")
        .matches(
          /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
          "Slug can only contain lowercase letters, numbers, and hyphens (no spaces or special characters)"
        ),
    }),
    { slug }
  );
