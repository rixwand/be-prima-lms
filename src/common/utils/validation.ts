import * as yup from "yup";
import { NODE_ENV } from "./env";
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
    if (error instanceof yup.ValidationError) {
      const message = formatYupError(error);
      throw new ApiError(400, JSON.stringify(message));
    } else {
      throw new ApiError(500, NODE_ENV == "development" ? JSON.stringify(error) : "Something went wrong");
    }
  }
};

export const validateIdParams = async (id: any) =>
  validate(
    yup.object({
      id: yup.number().positive().integer().required(),
    }),
    { id },
  );

export async function validateSlugParams(slug: unknown, option?: { optional: false }): Promise<{ slug: string }>;
export async function validateSlugParams(slug: unknown, option?: { optional: true }): Promise<{ slug?: string }>;

export async function validateSlugParams(slug: unknown, option?: { optional: boolean }) {
  const slugSchema = yup
    .string()
    .matches(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug can only contain lowercase letters, numbers, and hyphens (no spaces or special characters)",
    );

  return validate(
    yup.object({
      slug: !option?.optional ? slugSchema.required("Slug is required") : slugSchema.optional(),
    }),
    { slug },
  );
}
