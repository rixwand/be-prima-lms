import { Router } from "express";
import authMiddleware from "../../../middlewares/auth.middleware";
import { requireCourseOwnership } from "../../../middlewares/course.middleware";
import requirePermission from "../../../middlewares/rbac.middleware";
import { coursePublishController } from "../coursePublish/coursePublish.controller";
import { courseController } from "./course.controller";

const myCourse = Router();

myCourse.use(authMiddleware);
myCourse.get("/", requirePermission("view", "course", { scope: "own" }), courseController.myCourse);
myCourse.get(
  "/:courseId",
  requirePermission("view", "course", { scope: "own" }),
  requireCourseOwnership,
  courseController.get
);
myCourse.post("/", requirePermission("create", "course", { scope: "own" }), courseController.create);
myCourse.post(
  "/:courseId/publish",
  requirePermission("create", "course", { scope: "own" }),
  requireCourseOwnership,
  coursePublishController.createRequest
);
myCourse.patch(
  "/:courseId",
  requirePermission("edit", "course", { scope: "own" }),
  requireCourseOwnership,
  courseController.update
);
myCourse.patch(
  "/:courseId/tags",
  requirePermission("edit", "course", { scope: "own" }),
  requireCourseOwnership,
  courseController.updateTags
);

myCourse.delete(
  "/:courseId",
  requirePermission("delete", "course", { scope: "own" }),
  requireCourseOwnership,
  courseController.remove
);

myCourse.delete(
  "/:courseId/discounts/:discountId",
  requirePermission("delete", "course", { scope: "own" }),
  requireCourseOwnership,
  courseController.removeDiscount
);

myCourse.delete(
  "/deleteMany",
  requirePermission("delete", "course", { scope: "own" }),
  requireCourseOwnership,
  courseController.removeMany
);

export default myCourse;
