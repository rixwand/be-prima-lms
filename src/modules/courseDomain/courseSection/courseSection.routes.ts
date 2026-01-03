import { Router } from "express";
import { AUTH } from "../../../config";
import { requireCourseOwnership, requireHierarcy } from "../../../middlewares/course.middleware";
import requirePermission from "../../../middlewares/rbac.middleware";
import { courseSectionController } from "./courseSection.controller";

const courseSectionRoutes = Router({ mergeParams: true });

courseSectionRoutes.get(
  "/",
  requirePermission(AUTH.ACTIONS.VIEW, AUTH.RESOURCES.COURSE, { scope: [AUTH.SCOPES.OWN, AUTH.SCOPES.GLOBAL] }),
  requireCourseOwnership,
  courseSectionController.list
);
courseSectionRoutes.post(
  "/",
  requirePermission(AUTH.ACTIONS.CREATE, AUTH.RESOURCES.COURSE, { scope: AUTH.SCOPES.OWN }),
  requireCourseOwnership,
  courseSectionController.create
);
courseSectionRoutes.patch(
  "/reorder",
  requirePermission(AUTH.ACTIONS.EDIT, AUTH.RESOURCES.COURSE, { scope: AUTH.SCOPES.OWN }),
  requireCourseOwnership,
  courseSectionController.reorder
);
courseSectionRoutes.patch(
  "/:sectionId",
  requirePermission(AUTH.ACTIONS.EDIT, AUTH.RESOURCES.COURSE, { scope: AUTH.SCOPES.OWN }),
  requireHierarcy("section"),
  courseSectionController.update
);
courseSectionRoutes.delete(
  "/delete-many",
  requirePermission(AUTH.ACTIONS.DELETE, AUTH.RESOURCES.COURSE, { scope: AUTH.SCOPES.OWN }),
  courseSectionController.removeMany
);
courseSectionRoutes.delete(
  "/:sectionId",
  requirePermission(AUTH.ACTIONS.DELETE, AUTH.RESOURCES.COURSE, { scope: AUTH.SCOPES.OWN }),
  requireHierarcy("section"),
  courseSectionController.remove
);

export default courseSectionRoutes;
