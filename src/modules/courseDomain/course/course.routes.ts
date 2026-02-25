import { Router } from "express";
import { courseCategoryController } from "../courseCategories/courseCategories.controller";
import { courseController } from "./course.controller";

const courseRoutes = Router();
// /:slug is category slug
courseRoutes.get("/list{/:slug}", courseController.listPublicCourses);
courseRoutes.get("/list-tags", courseController.listPublicTags);
courseRoutes.get("/list-categories", courseCategoryController.list);
courseRoutes.get("/:courseSlug", courseController.preview);

export default courseRoutes;
