import { Router } from "express";
import authMiddleware from "../../middlewares/auth.middleware";
import requirePermission from "../../middlewares/rbac.middleware";
import { courseController } from "./course.controller";

const courseRoutes = Router();

courseRoutes.use(authMiddleware);
courseRoutes.post("/", requirePermission("create", "course", { scope: "own" }), courseController.create);

export default courseRoutes;
