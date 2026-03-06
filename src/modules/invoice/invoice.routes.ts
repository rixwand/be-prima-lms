import { Router } from "express";
import { AUTH } from "../../config";
import requirePermission from "../../middlewares/rbac.middleware";
import invoiceController from "./invoice.controller";

const invoiceRoutes = Router();

invoiceRoutes.get(
  "/",
  requirePermission(AUTH.ACTIONS.VIEW, AUTH.RESOURCES.INVOICE, { scope: AUTH.SCOPES.GLOBAL }),
  invoiceController.listAll,
);

export default invoiceRoutes;
