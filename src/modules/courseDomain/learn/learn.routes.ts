import { Router } from "express";
import { requireCourseEnrollment } from "../../../middlewares/course.middleware";
import learnController from "./learn.controller";

const learnRoutes = Router({ mergeParams: true });

learnRoutes.get("/", requireCourseEnrollment, learnController.getCurriculum);
learnRoutes.get("/start-course", requireCourseEnrollment, learnController.startCourse);
learnRoutes.patch("/lesson-complete/:lessonId", requireCourseEnrollment, learnController.lessonComplete);
learnRoutes.get("/:sectionId/:lessonId", requireCourseEnrollment, learnController.getLessonContent);

export default learnRoutes;
