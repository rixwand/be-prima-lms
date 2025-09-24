import * as yup from "yup";
import { formatYupError } from "./error";
import { ApiError } from "./http";

export const validate = async <T>(schema: yup.Schema<T>, data: any): Promise<yup.InferType<typeof schema>> => {
  try {
    const res = await schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });
    return res;
  } catch (error) {
    const err = error as yup.ValidationError;
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
