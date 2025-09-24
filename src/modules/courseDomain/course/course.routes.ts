import { Router } from "express";
import authMiddleware from "../../../middlewares/auth.middleware";
import { requireCourseOwnership } from "../../../middlewares/course.middleware";
import requirePermission from "../../../middlewares/rbac.middleware";
import { courseController } from "./course.controller";

const courseRoutes = Router();

courseRoutes.get("/list", courseController.list);
courseRoutes.use(authMiddleware);
courseRoutes.post("/", requirePermission("create", "course", { scope: "own" }), courseController.create);
courseRoutes.patch(
  "/:courseId",
  requirePermission("edit", "course", { scope: "own" }),
  requireCourseOwnership,
  courseController.update
);
courseRoutes.patch(
  "/:courseId/tag",
  requirePermission("edit", "course", { scope: "own" }),
  requireCourseOwnership,
  courseController.updateTags
);
export default courseRoutes;
