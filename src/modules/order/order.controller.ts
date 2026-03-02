import { AsyncRequestHandler, asyncHandler } from "../../common/utils/http";
import orderService from "./order.service";

const list: AsyncRequestHandler = async (req, res) => {
  const orders = await orderService.list(req.user?.id!);
  res.status(200).json({ data: orders });
};

export default {
  list: asyncHandler(list),
};
