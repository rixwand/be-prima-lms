import { Router } from "express";
import { courseCategoryController } from "../courseCategories/courseCategories.controller";
import { courseController } from "./course.controller";

const courseRoutes = Router();

courseRoutes.get("/public-courses{/:slug}", courseController.listPublicCourses);
courseRoutes.get("/list-tags", courseController.listPublicTags);
courseRoutes.get("/list-categories", courseCategoryController.list);
courseRoutes.get("/:courseSlug", courseController.preview);

export default courseRoutes;
