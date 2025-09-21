import { InferType, Schema, ValidationError, number } from "yup";
import { formatYupError } from "./error";
import { ApiError } from "./http";

export const validate = async <T>(schema: Schema<T>, data: any): Promise<InferType<typeof schema>> => {
  try {
    const res = await schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });
    return res;
  } catch (error) {
    const err = error as ValidationError;
    const message = formatYupError(err);
    throw new ApiError(400, JSON.stringify(message));
  }
};

export const validateIdParams = async (id: number) => validate(number().positive().integer().required(), id);
