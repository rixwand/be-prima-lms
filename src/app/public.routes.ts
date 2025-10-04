import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";
import courseRoutes from "../modules/courseDomain/course/course.routes";

const publicRoutes = Router();

publicRoutes.use("/auth", authRoutes);
publicRoutes.use("/courses", courseRoutes);

export default publicRoutes;
