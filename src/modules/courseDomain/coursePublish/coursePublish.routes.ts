import { Router } from "express";
import { AUTH } from "../../../config";
import authMiddleware from "../../../middlewares/auth.middleware";
import requirePermission from "../../../middlewares/rbac.middleware";
import { coursePublishController } from "./coursePublish.controller";

const coursePublishRoutes = Router();

coursePublishRoutes.use(authMiddleware);
coursePublishRoutes.use(requirePermission(AUTH.ACTIONS.PUBLISH, AUTH.RESOURCES.COURSE, { scope: AUTH.SCOPES.GLOBAL }));
coursePublishRoutes.get("/list", coursePublishController.listRequest);
coursePublishRoutes.put("/:requestId", coursePublishController.updateRequest);
coursePublishRoutes.delete("/:courseId", coursePublishController.deleteRequest);

export default coursePublishRoutes;
