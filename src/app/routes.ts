import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";
import courseRoutes from "../modules/course/course.routes";
import courseSectionRoutes from "../modules/courseSection/courseSection.routes";
import userRoutes from "../modules/users/users.routes";

const api = Router();

api.use("/auth", authRoutes);
api.use("/user", userRoutes);
api.use("/course", courseRoutes, courseSectionRoutes);

export default api;
