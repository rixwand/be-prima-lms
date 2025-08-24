import { ErrorRequestHandler } from "express";
import { cookieOpt, refreshCookieName } from "../common/utils/jwt";

export const errorMiddleware: ErrorRequestHandler = (err, _req, res, _next) => {
  const status = err?.status ?? 500;
  let message = err?.message ?? "Internal Server Error";
  if (status >= 500) console.error(err);
  if (message == "revoke") {
    message = "Refresh reuse detected";
    res.clearCookie(refreshCookieName, cookieOpt);
  }
  res.status(status).json({ error: message });
};
