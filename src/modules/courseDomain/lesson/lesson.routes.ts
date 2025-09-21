import { Router } from "express";
import authMiddleware from "../../../middlewares/auth.middleware";
import requireCourseOwnership from "../../../middlewares/course.middleware";
import requirePermission from "../../../middlewares/rbac.middleware";
import { lessonController } from "./lesson.controller";

const lessonRoutes = Router();

const PREFIX_URL = "/:courseId/section/:sectionId/lesson";

lessonRoutes.use(authMiddleware);
lessonRoutes.post(
  PREFIX_URL + "/",
  requirePermission("create", "course", { scope: "own" }),
  requireCourseOwnership,
  lessonController.create
);

export default lessonRoutes;
