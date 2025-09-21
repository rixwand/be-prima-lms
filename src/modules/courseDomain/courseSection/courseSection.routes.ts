import { Router } from "express";
import requireCourseOwnership from "../../../middlewares/course.middleware";
import requirePermission from "../../../middlewares/rbac.middleware";
import { courseSectionController } from "./courseSection.controller";

const courseSectionRoutes = Router();

courseSectionRoutes.post(
  "/:courseId/section",
  requirePermission("create", "course", { scope: "own" }),
  requireCourseOwnership,
  courseSectionController.create
);
// courseSectionRoutes.get("/:courseId/sections", requirePermission("view", "course"));

export default courseSectionRoutes;
