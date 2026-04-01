import { Router } from "express";
import notificationController from "./notification.controller";

const notificationRoutes = Router();

notificationRoutes.get("/", notificationController.listByUser);

export default notificationRoutes;
