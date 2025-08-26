import { ApiError, AsyncRequestHandler, asyncHandler } from "../common/utils/http";
import { verifyAccessToken } from "../common/utils/jwt";
import { userRepo } from "../modules/users/user.repository";
import { RequestUser } from "../types/global";

const authMiddleware: AsyncRequestHandler = async (req, _res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) throw new ApiError(401, "Unathorized");
  const [type, token] = authorization.split(" ");
  if (type != "Bearer" || !token) throw new ApiError(401, "Unathorized");
  const [payload, error] = verifyAccessToken(token);
  if (error) throw new ApiError(401, "Invalid token");
  const user = await userRepo.findById(payload.sub, {
    roles: { select: { role: { select: { id: true } } } },
    id: true,
    status: true,
  });
  if (!user) throw new ApiError(401, "Unathorized");
  if (user.status == "DISABLED") throw new ApiError(403, "Your account has been disabled. Please contact support.");
  // TODO: redirect user when its NOT_ACTIVATED
  req.user = { id: user.id, role_id: user.roles[0]?.role.id as number };
  req.user as RequestUser;
  next();
};

export default asyncHandler(authMiddleware);
