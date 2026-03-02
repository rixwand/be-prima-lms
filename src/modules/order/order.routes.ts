import { Router } from "express";
import orderController from "./order.controller";

const orderRoutes = Router();

orderRoutes.get("/list", orderController.list);

export default orderRoutes;
