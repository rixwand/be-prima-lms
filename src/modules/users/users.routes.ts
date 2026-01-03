import { Router } from "express";
import { AUTH } from "../../config";
import authMiddleware from "../../middlewares/auth.middleware";
import requirePermission from "../../middlewares/rbac.middleware";
import { userController } from "./user.controller";

const userRoutes = Router();

userRoutes.use(authMiddleware);
userRoutes.get("/me", userController.get);
userRoutes.patch("/me", userController.update);
userRoutes.patch("/update-password", userController.updatePassword);
userRoutes.get(
  "/list",
  requirePermission(AUTH.ACTIONS.MANAGE, AUTH.RESOURCES.USER, { scope: AUTH.SCOPES.GLOBAL }),
  userController.list
);

export default userRoutes;
