import { Router } from "express";
import { AUTH } from "../../config";
import requirePermission from "../../middlewares/rbac.middleware";
import invoiceController from "./invoice.controller";

const myInvoiceRoutes = Router();

myInvoiceRoutes.get(
  "/",
  requirePermission(AUTH.ACTIONS.VIEW, AUTH.RESOURCES.INVOICE, { scope: [AUTH.SCOPES.OWN] }),
  invoiceController.listByUser,
);

export default myInvoiceRoutes;
