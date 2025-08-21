import { Request, Response } from "express";
import { asyncHandler } from "../../common/utils/http";
import { validate } from "../../common/utils/validation";
import { registerSchema } from "./auth.validation";
import { authServices } from "./auth.service";
const register = async (req: Request, res: Response) => {
  const data = await validate(registerSchema, req.body);
  const user = await authServices.register(data);
  return res.status(200).json({ data: user });
};

export const AuthController = { register: asyncHandler(register) };
