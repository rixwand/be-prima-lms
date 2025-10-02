import { Router } from "express";
import { requireCourseOwnership, requireHierarcy } from "../../../middlewares/course.middleware";
import requirePermission from "../../../middlewares/rbac.middleware";
import { courseSectionController } from "./courseSection.controller";

const courseSectionRoutes = Router({ mergeParams: true });

courseSectionRoutes.post(
  "/",
  requirePermission("create", "course", { scope: "own" }),
  requireCourseOwnership,
  courseSectionController.create
);
// courseSectionRoutes.get("/", requirePermission("view", "course"));
courseSectionRoutes.patch(
  "/reorder",
  requirePermission("edit", "course", { scope: "own" }),
  requireCourseOwnership,
  courseSectionController.reorder
);
courseSectionRoutes.patch(
  "/:sectionId",
  requirePermission("edit", "course", { scope: "own" }),
  requireHierarcy("section"),
  courseSectionController.update
);
courseSectionRoutes.delete(
  "/:sectionId",
  requirePermission("delete", "course", { scope: "own" }),
  requireHierarcy("section"),
  courseSectionController.remove
);
courseSectionRoutes.delete(
  "/deleteMany",
  requirePermission("delete", "course", { scope: "own" }),
  courseSectionController.removeMany
);

export default courseSectionRoutes;
