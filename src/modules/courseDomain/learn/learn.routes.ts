import { Router } from "express";
import { requireCourseEnrollment } from "../../../middlewares/course.middleware";
import learnController from "./learn.controller";

const learnRoutes = Router({ mergeParams: true });

learnRoutes.get("/", requireCourseEnrollment, learnController.getCurriculum);
learnRoutes.get("/:sectionId/:lessonId", requireCourseEnrollment, learnController.getLessonContent);

export default learnRoutes;
