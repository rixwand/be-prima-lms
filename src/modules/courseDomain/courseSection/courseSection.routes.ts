import { Router } from "express";
import { requireCourseOwnership, requireHierarcy } from "../../../middlewares/course.middleware";
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
courseSectionRoutes.patch(
  "/:courseId/section/reorder",
  requirePermission("edit", "course", { scope: "own" }),
  requireCourseOwnership,
  courseSectionController.reorder
);
courseSectionRoutes.patch(
  "/:courseId/section/:sectionId",
  requirePermission("edit", "course", { scope: "own" }),
  requireHierarcy("section"),
  courseSectionController.update
);

export default courseSectionRoutes;
