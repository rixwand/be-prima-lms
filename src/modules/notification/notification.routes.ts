import { Router } from "express";
import notificationController from "./notification.controller";

const notificationRoutes = Router();

notificationRoutes.get("/", notificationController.listByUser);
notificationRoutes.patch("/read/all", notificationController.readAllNotif);
notificationRoutes.patch("/read/:notificationId", notificationController.readNotif);

export default notificationRoutes;
