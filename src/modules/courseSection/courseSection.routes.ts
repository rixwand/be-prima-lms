import { Router } from "express";
import requirePermission from "../../middlewares/rbac.middleware";
import { courseSectionController } from "./courseSection.controller";

const courseSectionRoutes = Router();

courseSectionRoutes.post(
  "/:courseId/sections",
  requirePermission("create", "course", { scope: "own" }),
  courseSectionController.create
);

export default courseSectionRoutes;
