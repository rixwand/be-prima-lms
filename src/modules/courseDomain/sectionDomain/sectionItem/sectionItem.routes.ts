import { Router } from "express";
import { AUTH } from "../../../../config";
import { requireHierarcy } from "../../../../middlewares/course.middleware";
import requirePermission from "../../../../middlewares/rbac.middleware";
import { sectionItemController } from "./sectionItem.controller";

const sectionItemRoutes = Router({ mergeParams: true });

sectionItemRoutes.get(
  "/",
  requirePermission(AUTH.ACTIONS.VIEW, AUTH.RESOURCES.COURSE, { scope: [AUTH.SCOPES.OWN, AUTH.SCOPES.GLOBAL] }),
  requireHierarcy("section"),
  sectionItemController.list,
);

sectionItemRoutes.post(
  "/",
  requirePermission(AUTH.ACTIONS.CREATE, AUTH.RESOURCES.COURSE, { scope: AUTH.SCOPES.OWN }),
  requireHierarcy("section"),
  sectionItemController.create,
);

sectionItemRoutes.patch(
  "/reorder",
  requirePermission(AUTH.ACTIONS.EDIT, AUTH.RESOURCES.COURSE, { scope: AUTH.SCOPES.OWN }),
  requireHierarcy("section"),
  sectionItemController.reorder,
);

sectionItemRoutes.delete(
  "/delete-many",
  requirePermission(AUTH.ACTIONS.DELETE, AUTH.RESOURCES.COURSE, { scope: AUTH.SCOPES.OWN }),
  requireHierarcy("section"),
  sectionItemController.removeMany,
);

sectionItemRoutes.delete(
  "/:itemId",
  requirePermission(AUTH.ACTIONS.DELETE, AUTH.RESOURCES.COURSE, { scope: AUTH.SCOPES.OWN }),
  requireHierarcy("sectionItem"),
  sectionItemController.remove,
);

export default sectionItemRoutes;
