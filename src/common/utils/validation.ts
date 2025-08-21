import { InferType, Schema, ValidationError } from "yup";
import { ApiError } from "./http";

export const validate = async <T>(
  schema: Schema<T>,
  data: any
): Promise<InferType<typeof schema>> => {
  try {
    const res = await schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });
    return res;
  } catch (error) {
    const err = error as ValidationError;
    throw new ApiError(400, err.message);
  }
};
