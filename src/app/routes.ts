import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";
import myCourse from "../modules/courseDomain/course/course.me.routes";
import courseSectionRoutes from "../modules/courseDomain/courseSection/courseSection.routes";
import lessonRoutes from "../modules/courseDomain/lesson/lesson.routes";
import userRoutes from "../modules/users/users.routes";

const api = Router();

api.use(authMiddleware);
api.use("/user", userRoutes);
api.use("/me/courses", myCourse);
api.use("/me/course/:courseId/sections", courseSectionRoutes);
api.use("/me/course/:courseId/section/:sectionId/lessons", lessonRoutes);

export default api;
