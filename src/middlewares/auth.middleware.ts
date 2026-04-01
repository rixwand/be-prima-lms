import { ApiError, AsyncRequestHandler, asyncHandler } from "../common/utils/http";
import { verifyAccessToken } from "../common/utils/jwt";
import { userRepo } from "../modules/users/user.repository";
import { RequestUser } from "../types/global";

export const parseBearerToken = (authorization: unknown): string | null => {
  if (typeof authorization !== "string") return null;
  const [type, token] = authorization.split(" ");
  if (type !== "Bearer" || !token) return null;
  return token;
};

export const authenticateAccessToken = async (token: string): Promise<RequestUser> => {
  const [payload, error] = verifyAccessToken(token);
  if (error) throw new ApiError(401, "Invalid token");
  const user = await userRepo.findById(payload.sub, {
    select: { status: true, id: true, roleId: true, role: { select: { name: true } } },
  });
  if (!user) throw new ApiError(401, "Unathorized");
  if (user.status == "DISABLED") throw new ApiError(403, "Your account has been disabled. Please contact support.");
  return { id: user.id, role_id: user.roleId, role: user.role.name };
};

const authMiddleware: AsyncRequestHandler = async (req, _res, next) => {
  const token = parseBearerToken(req.headers.authorization);
  if (!token) throw new ApiError(401, "Unathorized");
  req.user = await authenticateAccessToken(token);
  next();
};

export default asyncHandler(authMiddleware);
