import { XENDIT_CALLBACK_TOKEN } from "../../common/utils/env";
import { ApiError, AsyncRequestHandler, asyncHandler } from "../../common/utils/http";
import { validate } from "../../common/utils/validation";
import orderService from "./order.service";
import { createOrderSchema, listOrderParamsValidation } from "./order.validation";

const list: AsyncRequestHandler = async (req, res) => {
  const queries = await validate(listOrderParamsValidation, req.query);
  const data = await orderService.list(queries);
  res.status(200).json({ data });
};

const create: AsyncRequestHandler = async (req, res) => {
  const { courseId, code } = await validate(createOrderSchema, req.body);
  const invoice = await orderService.create({ courseId, ...(code && { code }), userId: req.user?.id! });
  res.status(200).json({ invoiceUrl: invoice.invoiceUrl, invoiceId: invoice.id });
};

const xenditWebhook: AsyncRequestHandler = async (req, res) => {
  const callbackToken = req.headers["x-callback-token"];
  if (callbackToken !== XENDIT_CALLBACK_TOKEN) throw new ApiError(403, "Forbidden");
  const { external_id, status } = req.body;
  if (status == "PAID") {
    await orderService.paymentSuccess(external_id);
  } else {
    await orderService.paymentFailed(external_id);
  }
};

export default {
  list: asyncHandler(list),
  create: asyncHandler(create),
  xenditWebhook: asyncHandler(xenditWebhook),
};
