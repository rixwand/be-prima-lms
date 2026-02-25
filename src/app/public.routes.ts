import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";
import courseRoutes from "../modules/courseDomain/course/course.routes";
import paymentController from "../modules/payment/payment.controller";

const publicRoutes = Router();

publicRoutes.use("/auth", authRoutes);
publicRoutes.use("/courses", courseRoutes);
publicRoutes.use("/webhook", paymentController.xenditWebhook);
export default publicRoutes;
