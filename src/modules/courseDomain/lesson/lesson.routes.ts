import { Router } from "express";
import { AUTH } from "../../../config";
import authMiddleware from "../../../middlewares/auth.middleware";
import { requireHierarcy } from "../../../middlewares/course.middleware";
import requirePermission from "../../../middlewares/rbac.middleware";
import { lessonController } from "./lesson.controller";

const lessonRoutes = Router({ mergeParams: true });

lessonRoutes.use(authMiddleware);
lessonRoutes.get(
  "/",
  requirePermission(AUTH.ACTIONS.VIEW, AUTH.RESOURCES.COURSE, { scope: [AUTH.SCOPES.OWN, AUTH.SCOPES.GLOBAL] }),
  requireHierarcy("section"),
  lessonController.list,
);
lessonRoutes.post(
  "/",
  requirePermission(AUTH.ACTIONS.CREATE, AUTH.RESOURCES.COURSE, { scope: AUTH.SCOPES.OWN }),
  requireHierarcy("section"),
  lessonController.create,
);

lessonRoutes.get(
  "/:lessonId",
  requirePermission(AUTH.ACTIONS.VIEW, AUTH.RESOURCES.COURSE, { scope: [AUTH.SCOPES.OWN, AUTH.SCOPES.GLOBAL] }),
  requireHierarcy("lesson"),
  lessonController.getContent,
);

lessonRoutes.patch(
  "/reorder",
  requirePermission(AUTH.ACTIONS.EDIT, AUTH.RESOURCES.COURSE, { scope: AUTH.SCOPES.OWN }),
  requireHierarcy("section"),
  lessonController.reorder,
);

lessonRoutes.post(
  "/:lessonId/publish-content",
  requirePermission(AUTH.ACTIONS.EDIT, AUTH.RESOURCES.COURSE, { scope: AUTH.SCOPES.OWN }),
  requireHierarcy("lesson"),
  lessonController.publishContent,
);

lessonRoutes.patch(
  "/:lessonId",
  requirePermission(AUTH.ACTIONS.EDIT, AUTH.RESOURCES.COURSE, { scope: AUTH.SCOPES.OWN }),
  requireHierarcy("lesson"),
  lessonController.update,
);

lessonRoutes.delete(
  "/delete-many",
  requirePermission(AUTH.ACTIONS.DELETE, AUTH.RESOURCES.COURSE, { scope: AUTH.SCOPES.OWN }),
  requireHierarcy("section"),
  lessonController.removeMany,
);

lessonRoutes.delete(
  "/:lessonId",
  requirePermission(AUTH.ACTIONS.DELETE, AUTH.RESOURCES.COURSE, { scope: AUTH.SCOPES.OWN }),
  requireHierarcy("lesson"),
  lessonController.remove,
);

export default lessonRoutes;
