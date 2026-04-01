import { AsyncRequestHandler, asyncHandler } from "../../common/utils/http";
import { validate } from "../../common/utils/validation";
import notificationService from "./notification.service";
import { listNotificationParamsValidation } from "./notification.validation";

const listByUser: AsyncRequestHandler = async (req, res) => {
  const queries = await validate(listNotificationParamsValidation, req.query);
  const data = await notificationService.listByUser(req.user?.id!, queries);
  res.status(200).json({ data });
};

export default {
  listByUser: asyncHandler(listByUser),
};
