import { XENDIT_CALLBACK_TOKEN } from "../../common/utils/env";
import { ApiError, AsyncRequestHandler, asyncHandler } from "../../common/utils/http";
import { validate } from "../../common/utils/validation";
import paymentService from "./payment.service";
import { createCoursePayment } from "./payment.validation";

const createPayment: AsyncRequestHandler = async (req, res) => {
  const { courseId, code } = await validate(createCoursePayment, req.body);
  const invoice = await paymentService.createInvoice({ courseId, userId: req.user?.id!, ...(code ? { code } : {}) });
  res.status(200).json({ invoiceUrl: invoice.invoiceUrl, invoiceId: invoice.id });
};
const xenditWebhook: AsyncRequestHandler = async (req, res) => {
  const callbackToken = req.headers["x-callback-token"];
  if (callbackToken !== XENDIT_CALLBACK_TOKEN) throw new ApiError(403, "Forbidden");
  const { external_id, status } = req.body;
  if (status == "PAID") {
    const success = await paymentService.paymentSuccess(external_id);
  } else if (status == "FAILED") {
    const failed = await paymentService.paymentFailed(external_id);
  }
  res.status(200).json({ data: { status } });
};

export default {
  createPayment: asyncHandler(createPayment),
  xenditWebhook: asyncHandler(xenditWebhook),
};
