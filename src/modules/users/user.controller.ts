import { AsyncRequestHandler, asyncHandler } from "../../common/utils/http";
import { validate } from "../../common/utils/validation";
import { userService } from "./user.service";
import { updatePasswordSchema, updateUserSchema } from "./user.validation";

const get: AsyncRequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const user = await userService.get(userId);
  res.status(200).json({ data: user });
};

const update: AsyncRequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const data = await validate(updateUserSchema, req.body);
  const user = await userService.update(userId, data);
  res.status(200).json({ data: user });
};

const updatePassword: AsyncRequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const data = await validate(updatePasswordSchema, req.body);
  await userService.updatePassword(userId, data);
  res.status(200).json({ data: { message: "Password successfully changed" } });
};

export const userController = {
  get: asyncHandler(get),
  update: asyncHandler(update),
  updatePassword: asyncHandler(updatePassword),
};
