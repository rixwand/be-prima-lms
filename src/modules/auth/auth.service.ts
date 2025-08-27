import { comparePassword, hashPassword } from "../../common/utils/hash";
import { ApiError } from "../../common/utils/http";
import { newJti, signAccessToken, signRefreshToken, verifyRefreshToken } from "../../common/utils/jwt";
import { roleRepo } from "../role/role.repository";
import { RefreshSessionRepo } from "../session/session.repository";
import { SessionService } from "../session/session.service";
import { userRepo } from "../users/user.repository";
import { IUserLogin, IUserRegister } from "./auth.types";

export const authServices = {
  async register({ password, ...user }: IUserRegister) {
    const passwordHash = await hashPassword(password);
    const role = await roleRepo.findByName("member");
    if (!role) throw new ApiError(500, "Role not found");
    const res = await userRepo.create({ ...user, roleId: role.id, passwordHash });
    return res;
  },

  async login({ email, password }: IUserLogin) {
    const user = await userRepo.findByEmail(email);
    if (!user) throw new ApiError(401, "Invalid email or password");
    const passwordMatch = await comparePassword(password, user.passwordHash);
    if (!passwordMatch) throw new ApiError(401, "Invalid email or password");

    const jti = newJti();
    const accessToken = signAccessToken(user.id, jti);
    const refreshToken = signRefreshToken(user.id, jti);

    await SessionService.create(user.id, jti);

    return { accessToken, refreshToken };
  },

  async refresh(token: string) {
    const [payload, error] = verifyRefreshToken(token);
    if (error) throw new ApiError(401, "Invalid refresh token");
    if (payload.type !== "refresh") throw new ApiError(401, "Invalid token");
    const session = await RefreshSessionRepo.get(payload.jti);

    if (!session || session.revokedAt) {
      await SessionService.revokeChain(payload.jti);
      throw new ApiError(401, "revoke");
    }

    const jti = newJti();
    SessionService.rotate({
      newJti: jti,
      oldJti: payload.jti,
      userId: session.userId,
    });
    const newAccessToken = signAccessToken(session.userId, jti);
    const newRefreshToken = signRefreshToken(session.userId, jti);

    return { newAccessToken, newRefreshToken };
  },
};
