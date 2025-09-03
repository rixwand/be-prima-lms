import { Router } from "express";
import authMiddleware from "../../middlewares/auth.middleware";
import { authController } from "./auth.controller";

const authRoutes = Router();

authRoutes.post("/register", authController.register);
authRoutes.post("/login", authController.login);
authRoutes.post("/refresh", authController.refresh);
authRoutes.post("/activation", authController.activation);
authRoutes.delete("/logout", authController.logout);
authRoutes.delete("/logout-all", authMiddleware, authController.logoutAll);

export default authRoutes;
