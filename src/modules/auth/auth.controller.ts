import { ApiError, AsyncRequestHandler, asyncHandler } from "../../common/utils/http";
import { cookieOpt, refreshCookieName } from "../../common/utils/jwt";
import { validate } from "../../common/utils/validation";
import { authServices } from "./auth.service";
import { activationSchema, loginSchema, registerSchema } from "./auth.validation";

const register: AsyncRequestHandler = async (req, res) => {
  const data = await validate(registerSchema, req.body);
  const user = await authServices.register(data);
  return res.status(200).json({ data: { user } });
};

const login: AsyncRequestHandler = async (req, res) => {
  const data = await validate(loginSchema, req.body);
  const { accessToken, refreshToken } = await authServices.login(data);
  res.cookie(refreshCookieName, refreshToken, cookieOpt);
  res.status(200).json({ data: { accessToken } });
};

const refresh: AsyncRequestHandler = async (req, res) => {
  const token = req.cookies[refreshCookieName] as string | undefined;
  if (!token) throw new ApiError(401, "Missing refresh cookie");
  const { newAccessToken, newRefreshToken } = await authServices.refresh(token);
  res.cookie(refreshCookieName, newRefreshToken, cookieOpt);
  res.status(200).json({ data: { accessToken: newAccessToken } });
};

const activation: AsyncRequestHandler = async (req, res) => {
  const { code } = await validate(activationSchema, req.body);
  await authServices.activateAccount(code);
  res.status(200).json({ data: { message: "Account activated. You can login now" } });
};

const logout: AsyncRequestHandler = async (req, res) => {
  const refToken = req.cookies[refreshCookieName];
  await authServices.logout(refToken);
  res.clearCookie(refreshCookieName, cookieOpt);
  res.status(200).json({ data: { message: "Logout success" } });
};

const logoutAll: AsyncRequestHandler = async (req, res) => {
  const refToken = req.cookies[refreshCookieName];
  if (!refToken) throw new ApiError(401, "Missing refresh cookie");
  await authServices.logoutAll(refToken);
  res.status(200).json({ data: { message: "Logout from all devices" } });
};

export const authController = {
  register: asyncHandler(register),
  login: asyncHandler(login),
  refresh: asyncHandler(refresh),
  activation: asyncHandler(activation),
  logout: asyncHandler(logout),
  logoutAll: asyncHandler(logoutAll),
};
