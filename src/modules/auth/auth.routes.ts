import { Router } from "express";
import { authController } from "./auth.controller";

const authRoutes = Router();

authRoutes.post("/register", authController.register);
authRoutes.post("/login", authController.login);
authRoutes.post("/refresh", authController.refresh);
authRoutes.post("/activation", authController.activation);

export default authRoutes;
