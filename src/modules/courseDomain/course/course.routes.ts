import { Router } from "express";
import { courseController } from "./course.controller";

const courseRoutes = Router();

courseRoutes.get("/list", courseController.list);
courseRoutes.get("/:courseSlug", courseController.preview);
export default courseRoutes;
