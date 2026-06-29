import { Router } from "express";
import { requireCourseEnrollment } from "../../../middlewares/course.middleware";
import learnController from "./learn.controller";

const learnRoutes = Router({ mergeParams: true });

learnRoutes.get("/", requireCourseEnrollment, learnController.getCurriculum);
learnRoutes.get("/start-course", requireCourseEnrollment, learnController.startCourse);
learnRoutes.patch("/lesson-complete/:sectionItemId", requireCourseEnrollment, learnController.lessonComplete);
learnRoutes.post("/:sectionId/:itemId/quiz/start-quiz", requireCourseEnrollment, learnController.startQuiz);
learnRoutes.post(
  "/:sectionId/:itemId/quiz/submit-quiz/:attemptId",
  requireCourseEnrollment,
  learnController.submitQuiz,
);
learnRoutes.get("/:sectionId/:itemId/:itemType", requireCourseEnrollment, learnController.getItemContent);
export default learnRoutes;
