import { Router } from "express";
import { AUTH } from "../../../config";
import authMiddleware from "../../../middlewares/auth.middleware";
import requirePermission from "../../../middlewares/rbac.middleware";
import { coursePublishController } from "./coursePublish.controller";
import { coursePublishService } from "./coursePublish.service";

const coursePublishRoutes = Router();

coursePublishRoutes.use(authMiddleware);
coursePublishRoutes.use(requirePermission(AUTH.ACTIONS.PUBLISH, AUTH.RESOURCES.COURSE, { scope: AUTH.SCOPES.GLOBAL }));
coursePublishRoutes.get("/list", coursePublishController.listRequest);
coursePublishRoutes.post("/approve/:requestId", coursePublishService.approveRequest);
coursePublishRoutes.post("/reject/:requestId", coursePublishService.rejectRequest);

export default coursePublishRoutes;
