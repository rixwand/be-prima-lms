import { Router } from "express";
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
  requirePermission("view", "course", { scope: "own" }),
  requireHierarcy("section"),
  lessonController.list
);
lessonRoutes.post(
  "/",
  requirePermission("create", "course", { scope: "own" }),
  requireHierarcy("section"),
  lessonController.create
);

lessonRoutes.patch(
  "/reorder",
  requirePermission("edit", "course", { scope: "own" }),
  requireHierarcy("section"),
  lessonController.reorder
);

lessonRoutes.patch(
  "/:lessonId",
  requirePermission("edit", "course", { scope: "own" }),
  requireHierarcy("lesson"),
  lessonController.update
);

lessonRoutes.delete(
  "/delete-many",
  requirePermission("delete", "course", { scope: "own" }),
  requireHierarcy("section"),
  lessonController.removeMany
);

lessonRoutes.delete(
  "/:lessonId",
  requirePermission("delete", "course", { scope: "own" }),
  requireHierarcy("lesson"),
  lessonController.remove
);

export default lessonRoutes;
