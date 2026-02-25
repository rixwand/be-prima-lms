import { Router } from "express";
import enrollmentController from "./enrollment.controller";

const enrollmentRoutes = Router();

enrollmentRoutes.get("/", enrollmentController.listEnrolledCourse);

export default enrollmentRoutes;
