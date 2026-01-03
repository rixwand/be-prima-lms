import { Router } from "express";
import { AUTH } from "../../../config";
import authMiddleware from "../../../middlewares/auth.middleware";
import { requireHierarcy } from "../../../middlewares/course.middleware";
import requirePermission from "../../../middlewares/rbac.middleware";
import lessonBlockRoutes from "../lessonBlock/lessonBlock.routes";
import { lessonController } from "./lesson.controller";

const lessonRoutes = Router({ mergeParams: true });

lessonRoutes.use(authMiddleware);
lessonRoutes.use("/:lessonId/blocks", lessonBlockRoutes);
lessonRoutes.get(
  "/",
  requirePermission(AUTH.ACTIONS.VIEW, AUTH.RESOURCES.COURSE, { scope: [AUTH.SCOPES.OWN, AUTH.SCOPES.GLOBAL] }),
  requireHierarcy("section"),
  lessonController.list
);
lessonRoutes.post(
  "/",
  requirePermission(AUTH.ACTIONS.CREATE, AUTH.RESOURCES.COURSE, { scope: AUTH.SCOPES.OWN }),
  requireHierarcy("section"),
  lessonController.create
);

lessonRoutes.patch(
  "/reorder",
  requirePermission(AUTH.ACTIONS.EDIT, AUTH.RESOURCES.COURSE, { scope: AUTH.SCOPES.OWN }),
  requireHierarcy("section"),
  lessonController.reorder
);

lessonRoutes.patch(
  "/:lessonId",
  requirePermission(AUTH.ACTIONS.EDIT, AUTH.RESOURCES.COURSE, { scope: AUTH.SCOPES.OWN }),
  requireHierarcy("lesson"),
  lessonController.update
);

lessonRoutes.delete(
  "/delete-many",
  requirePermission(AUTH.ACTIONS.DELETE, AUTH.RESOURCES.COURSE, { scope: AUTH.SCOPES.OWN }),
  requireHierarcy("section"),
  lessonController.removeMany
);

lessonRoutes.delete(
  "/:lessonId",
  requirePermission(AUTH.ACTIONS.DELETE, AUTH.RESOURCES.COURSE, { scope: AUTH.SCOPES.OWN }),
  requireHierarcy("lesson"),
  lessonController.remove
);

export default lessonRoutes;
