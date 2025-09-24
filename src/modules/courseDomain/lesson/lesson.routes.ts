import { Router } from "express";
import authMiddleware from "../../../middlewares/auth.middleware";
import { requireHierarcy } from "../../../middlewares/course.middleware";
import requirePermission from "../../../middlewares/rbac.middleware";
import { lessonController } from "./lesson.controller";

const lessonRoutes = Router();

const PREFIX_URL = "/:courseId/section/:sectionId/lesson";

lessonRoutes.use(authMiddleware);
lessonRoutes.post(
  PREFIX_URL + "/",
  requirePermission("create", "course", { scope: "own" }),
  requireHierarcy("section"),
  lessonController.create
);

lessonRoutes.patch(
  PREFIX_URL + "/:lessonId",
  requirePermission("edit", "course", { scope: "own" }),
  requireHierarcy("lesson"),
  lessonController.update
);

export default lessonRoutes;
