import { Router } from "express";
import authMiddleware from "../../../middlewares/auth.middleware";
import { requireHierarcy } from "../../../middlewares/course.middleware";
import requirePermission from "../../../middlewares/rbac.middleware";
import { lessonController } from "./lesson.controller";
import lessonBlockRoutes from "../lessonBlock/lessonBlock.routes";

const lessonRoutes = Router({ mergeParams: true });

lessonRoutes.use(authMiddleware);
lessonRoutes.use("/:lessonId/blocks", lessonBlockRoutes);
lessonRoutes.post(
  "/",
  requirePermission("create", "course", { scope: "own" }),
  requireHierarcy("section"),
  lessonController.create
);

lessonRoutes.patch(
  "/:lessonId",
  requirePermission("edit", "course", { scope: "own" }),
  requireHierarcy("lesson"),
  lessonController.update
);

lessonRoutes.delete(
  "/:lessonId",
  requirePermission("delete", "course", { scope: "own" }),
  requireHierarcy("lesson"),
  lessonController.remove
);

lessonRoutes.delete(
  "/deleteMany",
  requirePermission("delete", "course", { scope: "own" }),
  requireHierarcy("section"),
  lessonController.removeMany
);

export default lessonRoutes;
