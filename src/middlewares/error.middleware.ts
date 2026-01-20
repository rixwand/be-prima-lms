import { ErrorRequestHandler } from "express";
import { isUniqueConstraintError } from "../common/utils/error";
import { cookieOpt, refreshCookieName } from "../common/utils/jwt";

export const errorMiddleware: ErrorRequestHandler = (err, _req, res, _next) => {
  let status = err?.status ?? 500;
  let message = err?.message ?? "Internal Server Error";
  if (status >= 500) console.error(err);
  if (message == "revoke") {
    message = "Refresh reuse detected";
    res.clearCookie(refreshCookieName, cookieOpt);
  }
  if (isUniqueConstraintError(err)) {
    const target = (err.meta as any)?.target as string[] | string;
    const model = (err.meta as any)?.modelName as string | undefined;
    const isSlugCollision = Array.isArray(target) ? target.includes("slug") : target === "slug";
    if (isSlugCollision) message = `${model || "Data"} with this title/slug already exist`;
    else message = `Duplicate entry of [${typeof target == "string" ? target : target.join(", ")}]`;
    status = 400;
  }

  res.status(status).json({ error: message });
};
