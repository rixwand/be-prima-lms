import { Router } from "express";
import { AUTH } from "../../../../config";
import { requireHierarcy } from "../../../../middlewares/course.middleware";
import requirePermission from "../../../../middlewares/rbac.middleware";
import { lessonController } from "./lesson.controller";

const lessonRoutes = Router({ mergeParams: true });

lessonRoutes.get(
  "/",
  requirePermission(AUTH.ACTIONS.VIEW, AUTH.RESOURCES.COURSE, { scope: [AUTH.SCOPES.OWN, AUTH.SCOPES.GLOBAL] }),
  requireHierarcy("sectionItem"),
  lessonController.getContent,
);

lessonRoutes.patch(
  "/",
  requirePermission(AUTH.ACTIONS.EDIT, AUTH.RESOURCES.COURSE, { scope: AUTH.SCOPES.OWN }),
  requireHierarcy("sectionItem"),
  lessonController.update,
);

lessonRoutes.patch(
  "/publish",
  requirePermission(AUTH.ACTIONS.EDIT, AUTH.RESOURCES.COURSE, { scope: AUTH.SCOPES.OWN }),
  requireHierarcy("sectionItem"),
  lessonController.publishContent,
);

export default lessonRoutes;
