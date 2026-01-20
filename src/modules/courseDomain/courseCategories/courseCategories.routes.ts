import { Router } from "express";
import { AUTH } from "../../../config";
import authMiddleware from "../../../middlewares/auth.middleware";
import requirePermission from "../../../middlewares/rbac.middleware";
import { courseCategoryController } from "./courseCategories.controller";

const { CREATE, DELETE, EDIT, VIEW } = AUTH.ACTIONS;
const courseCategoryRoutes = Router();

courseCategoryRoutes.use(authMiddleware);

courseCategoryRoutes.post(
  "/",
  requirePermission(CREATE, AUTH.RESOURCES.COURSE, {
    scope: AUTH.SCOPES.GLOBAL,
  }),
  courseCategoryController.create
);

courseCategoryRoutes.post(
  "/many",
  requirePermission(CREATE, AUTH.RESOURCES.COURSE, {
    scope: AUTH.SCOPES.GLOBAL,
  }),
  courseCategoryController.createMany
);

courseCategoryRoutes.get(
  "/:id",
  requirePermission(VIEW, AUTH.RESOURCES.COURSE, {
    scope: AUTH.SCOPES.GLOBAL,
  }),
  courseCategoryController.get
);

courseCategoryRoutes.put(
  "/:id",
  requirePermission(EDIT, AUTH.RESOURCES.COURSE, {
    scope: AUTH.SCOPES.GLOBAL,
  }),
  courseCategoryController.update
);

courseCategoryRoutes.delete(
  "/",
  requirePermission(DELETE, AUTH.RESOURCES.COURSE, {
    scope: AUTH.SCOPES.GLOBAL,
  }),
  courseCategoryController.removeMany
);

courseCategoryRoutes.delete(
  "/:id",
  requirePermission(DELETE, AUTH.RESOURCES.COURSE, {
    scope: AUTH.SCOPES.GLOBAL,
  }),
  courseCategoryController.remove
);

export default courseCategoryRoutes;
