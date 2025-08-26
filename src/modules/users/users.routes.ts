import { Router } from "express";
import authMiddleware from "../../middlewares/auth.middleware";
import { userController } from "./user.controller";

const userRoutes = Router();

userRoutes.use(authMiddleware);
userRoutes.get("/me", userController.get);

export default userRoutes;
