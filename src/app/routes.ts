import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";

const api = Router();

api.use("/auth", authRoutes);

export default api;
