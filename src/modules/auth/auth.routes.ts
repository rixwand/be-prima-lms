import { Router } from "express";
import { AuthController } from "./auth.controller";

const authRoutes = Router();

authRoutes.post("/register", AuthController.register);
authRoutes.post("/login", AuthController.login);
authRoutes.post("/refresh", AuthController.refresh);

export default authRoutes;
