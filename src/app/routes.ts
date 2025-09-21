import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";
import courseRoutes from "../modules/courseDomain/course/course.routes";
import courseSectionRoutes from "../modules/courseDomain/courseSection/courseSection.routes";
import lessonRoutes from "../modules/courseDomain/lesson/lesson.routes";
import userRoutes from "../modules/users/users.routes";

const api = Router();

api.use("/auth", authRoutes);
api.use("/user", userRoutes);
api.use("/course", courseRoutes, courseSectionRoutes, lessonRoutes);

export default api;
