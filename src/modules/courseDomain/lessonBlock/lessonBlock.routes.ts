import { Router } from "express";
import { requireHierarcy } from "../../../middlewares/course.middleware";
import requirePermission from "../../../middlewares/rbac.middleware";
import { lessonBlockController } from "./lessonBlock.controller";

const lessonBlockRoutes = Router({ mergeParams: true });

lessonBlockRoutes.get(
  "/",
  requirePermission("view", "course", { scope: "own" }),
  requireHierarcy("lesson"),
  lessonBlockController.list
);

lessonBlockRoutes.post(
  "/",
  requirePermission("create", "course", { scope: "own" }),
  requireHierarcy("lesson"),
  lessonBlockController.create
);

lessonBlockRoutes.get(
  "/:blockId",
  requirePermission("view", "course", { scope: "own" }),
  requireHierarcy("block"),
  lessonBlockController.detail
);

lessonBlockRoutes.patch(
  "/:blockId",
  requirePermission("edit", "course", { scope: "own" }),
  requireHierarcy("block"),
  lessonBlockController.update
);

lessonBlockRoutes.delete(
  "/:blockId",
  requirePermission("delete", "course", { scope: "own" }),
  requireHierarcy("block"),
  lessonBlockController.remove
);

export default lessonBlockRoutes;
