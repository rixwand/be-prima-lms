import { AsyncRequestHandler, asyncHandler } from "../../common/utils/http";
import { userService } from "./user.service";

const get: AsyncRequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const user = await userService.get(userId);
  res.status(200).json({ data: user });
};
export const userController = {
  get: asyncHandler(get),
};
