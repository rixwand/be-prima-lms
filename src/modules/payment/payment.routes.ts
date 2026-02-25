import { Router } from "express";
import paymentController from "./payment.controller";

const paymentRoutes = Router();

paymentRoutes.post("/purchase/course", paymentController.createPayment);

export default paymentRoutes;
