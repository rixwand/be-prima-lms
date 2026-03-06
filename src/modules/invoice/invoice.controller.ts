import { AsyncRequestHandler, asyncHandler } from "../../common/utils/http";
import { validate } from "../../common/utils/validation";
import invoiceService from "./invoice.service";
import { listInvoiceParamsValidation } from "./invoice.validation";

const listByUser: AsyncRequestHandler = async (req, res) => {
  const queries = await validate(listInvoiceParamsValidation, req.query);
  const data = await invoiceService.listByUser(req.user?.id!, queries);
  res.status(200).json({ data });
};

const listAll: AsyncRequestHandler = async (req, res) => {
  const queries = await validate(listInvoiceParamsValidation, req.query);
  const data = await invoiceService.listAll(queries);
  res.status(200).json({ data });
};

export default {
  listByUser: asyncHandler(listByUser),
  listAll: asyncHandler(listAll),
};
