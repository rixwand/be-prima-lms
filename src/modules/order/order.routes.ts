import { Router } from "express";
import { AUTH } from "../../config";
import requirePermission from "../../middlewares/rbac.middleware";
import orderController from "./order.controller";

const orderRoutes = Router();

orderRoutes.get(
  "/",
  requirePermission(AUTH.ACTIONS.VIEW, AUTH.RESOURCES.ORDER, { scope: AUTH.SCOPES.GLOBAL }),
  orderController.list,
);
orderRoutes.post(
  "/create",
  requirePermission(AUTH.ACTIONS.CREATE, AUTH.RESOURCES.ORDER, { scope: AUTH.SCOPES.OWN }),
  orderController.create,
);

export default orderRoutes;
