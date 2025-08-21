import { Router } from "express";
import { AuthController } from "./auth.controller";

const authRoutes = Router();

authRoutes.post("/register", AuthController.register);

export default authRoutes;
