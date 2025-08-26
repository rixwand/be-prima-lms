import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";
import userRoutes from "../modules/users/users.routes";

const api = Router();

api.use("/auth", authRoutes);
api.use("/user", userRoutes);

export default api;
