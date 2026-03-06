import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";
import courseRoutes from "../modules/courseDomain/course/course.routes";
import orderController from "../modules/order/order.controller";

const publicRoutes = Router();

publicRoutes.use("/auth", authRoutes);
publicRoutes.use("/courses", courseRoutes);
publicRoutes.use("/webhook", orderController.xenditWebhook);
export default publicRoutes;
