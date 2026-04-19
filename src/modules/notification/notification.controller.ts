import { AsyncRequestHandler, asyncHandler } from "../../common/utils/http";
import { validate, validateIdParams } from "../../common/utils/validation";
import notificationService from "./notification.service";
import { listNotificationParamsValidation } from "./notification.validation";

const listByUser: AsyncRequestHandler = async (req, res) => {
  const queries = await validate(listNotificationParamsValidation, req.query);
  const data = await notificationService.listByUser(req.user?.id!, queries);
  res.status(200).json({ data });
};

const readAllNotif: AsyncRequestHandler = async (req, res) => {
  const { count } = await notificationService.readNotification({ id: "all", userId: req.user?.id! });
  res.status(200).json({ data: { message: `${count} notifications readed` } });
};

const readNotif: AsyncRequestHandler = async (req, res) => {
  const { id } = await validateIdParams(req.params.notificationId);
  const { id: readedId } = await notificationService.readNotification({ id, userId: req.user?.id! });
  res.status(200).json({ data: { id: readedId } });
};

export default {
  listByUser: asyncHandler(listByUser),
  readAllNotif: asyncHandler(readAllNotif),
  readNotif: asyncHandler(readNotif),
};
