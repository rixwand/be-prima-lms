import { Router } from "express";
import { AUTH } from "../../../config";
import { requireHierarcy } from "../../../middlewares/course.middleware";
import requirePermission from "../../../middlewares/rbac.middleware";
import { lessonBlockController } from "./lessonBlock.controller";

const lessonBlockRoutes = Router({ mergeParams: true });

lessonBlockRoutes.get(
  "/",
  requirePermission(AUTH.ACTIONS.VIEW, AUTH.RESOURCES.COURSE, { scope: [AUTH.SCOPES.OWN, AUTH.SCOPES.GLOBAL] }),
  requireHierarcy("lesson"),
  lessonBlockController.list
);

lessonBlockRoutes.post(
  "/",
  requirePermission(AUTH.ACTIONS.CREATE, AUTH.RESOURCES.COURSE, { scope: AUTH.SCOPES.OWN }),
  requireHierarcy("lesson"),
  lessonBlockController.create
);

lessonBlockRoutes.get(
  "/:blockId",
  requirePermission(AUTH.ACTIONS.VIEW, AUTH.RESOURCES.COURSE, { scope: AUTH.SCOPES.OWN }),
  requireHierarcy("block"),
  lessonBlockController.detail
);

lessonBlockRoutes.patch(
  "/:blockId",
  requirePermission(AUTH.ACTIONS.EDIT, AUTH.RESOURCES.COURSE, { scope: AUTH.SCOPES.OWN }),
  requireHierarcy("block"),
  lessonBlockController.update
);

lessonBlockRoutes.delete(
  "/:blockId",
  requirePermission(AUTH.ACTIONS.DELETE, AUTH.RESOURCES.COURSE, { scope: AUTH.SCOPES.OWN }),
  requireHierarcy("block"),
  lessonBlockController.remove
);

export default lessonBlockRoutes;
