import { Router } from "express";
import { AUTH } from "../../../config";
import authMiddleware from "../../../middlewares/auth.middleware";
import { requireCourseOwnership } from "../../../middlewares/course.middleware";
import requirePermission from "../../../middlewares/rbac.middleware";
import { coursePublishController } from "../coursePublish/coursePublish.controller";
import { courseController } from "./course.controller";

const { CREATE, DELETE, EDIT, MANAGE, VIEW } = AUTH.ACTIONS;

const myCourse = Router();

myCourse.use(authMiddleware);
myCourse.get(
  "/",
  requirePermission(VIEW, AUTH.RESOURCES.COURSE, { scope: AUTH.SCOPES.OWN }),
  courseController.myCourses
);
myCourse.get(
  "/:courseId",
  requirePermission(VIEW, AUTH.RESOURCES.COURSE, { scope: [AUTH.SCOPES.OWN, AUTH.SCOPES.GLOBAL] }),
  requireCourseOwnership,
  courseController.get
);
myCourse.post(
  "/",
  requirePermission(CREATE, AUTH.RESOURCES.COURSE, { scope: AUTH.SCOPES.OWN }),
  courseController.create
);
myCourse.post(
  "/:courseId/publish",
  requirePermission(CREATE, AUTH.RESOURCES.COURSE, { scope: AUTH.SCOPES.OWN }),
  requireCourseOwnership,
  coursePublishController.createRequest
);
myCourse.delete(
  "/:courseId/cancel-publish",
  requirePermission(CREATE, AUTH.RESOURCES.COURSE, { scope: AUTH.SCOPES.OWN }),
  requireCourseOwnership,
  coursePublishController.cancelRequest
);

myCourse.patch(
  "/:courseId/unpublish",
  requirePermission(EDIT, AUTH.RESOURCES.COURSE, { scope: AUTH.SCOPES.OWN }),
  requireCourseOwnership,
  courseController.update
);

myCourse.patch(
  "/:courseId",
  requirePermission(EDIT, AUTH.RESOURCES.COURSE, { scope: AUTH.SCOPES.OWN }),
  requireCourseOwnership,
  courseController.update
);

myCourse.patch(
  "/:courseId/update-categories",
  requirePermission(EDIT, AUTH.RESOURCES.COURSE, { scope: AUTH.SCOPES.OWN }),
  requireCourseOwnership,
  courseController.updateTags
);

myCourse.patch(
  "/:courseId/tags",
  requirePermission(EDIT, AUTH.RESOURCES.COURSE, { scope: AUTH.SCOPES.OWN }),
  requireCourseOwnership,
  courseController.updateTags
);

myCourse.delete(
  "/deleteMany",
  requirePermission(DELETE, AUTH.RESOURCES.COURSE, { scope: AUTH.SCOPES.OWN }),
  requireCourseOwnership,
  courseController.removeMany
);

myCourse.delete(
  "/:courseId",
  requirePermission(DELETE, AUTH.RESOURCES.COURSE, { scope: AUTH.SCOPES.OWN }),
  requireCourseOwnership,
  courseController.remove
);

myCourse.delete(
  "/:courseId/discounts/:discountId",
  requirePermission(DELETE, AUTH.RESOURCES.COURSE, { scope: AUTH.SCOPES.OWN }),
  requireCourseOwnership,
  courseController.removeDiscount
);

export default myCourse;
