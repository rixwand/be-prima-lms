import { renderMail, sendMail } from "../../common/libs/mail/mailer";
import { ACTIVATION_TOKEN_TTL_HOURS, CLIENT_URL } from "../../common/utils/env";
import { comparePassword, hashPassword, randHex, sha256 } from "../../common/utils/hash";
import { ApiError } from "../../common/utils/http";
import { newJti, signAccessToken, signRefreshToken, verifyRefreshToken } from "../../common/utils/jwt";
import { roleRepo } from "../role/role.repository";
import { sessionRepo } from "../session/session.repository";
import { sessionService } from "../session/session.service";
import { userRepo } from "../users/user.repository";
import { authRepo } from "./auth.repository";
import { ISendActivationMail, IUserLogin, IUserRegister } from "./auth.types";

// TODO: Implement resend activation link

export const authServices = {
  async register({ password, ...user }: IUserRegister) {
    const passwordHash = await hashPassword(password);
    const role = await roleRepo.findByName("member");
    if (!role) throw new ApiError(500, "Role not found");
    try {
      const res = await userRepo.create({ ...user, roleId: role.id, passwordHash });
      await sendActivationEmail({ userId: res.id, fullName: res.fullName, email: res.email });
      return res;
    } catch (e) {
      const error = e as Error;
      throw new ApiError(500, error.message);
    }
  },

  async login({ email, password }: IUserLogin) {
    const user = await userRepo.findByEmail(email);
    if (!user) throw new ApiError(401, "Invalid email or password");
    const passwordMatch = await comparePassword(password, user.passwordHash);
    if (!passwordMatch) throw new ApiError(401, "Invalid email or password");

    const jti = newJti();
    const accessToken = signAccessToken(user.id, jti);
    const refreshToken = signRefreshToken(user.id, jti);

    await sessionService.create(user.id, jti);

    return { accessToken, refreshToken };
  },

  async refresh(token: string) {
    const [payload, error] = verifyRefreshToken(token);
    if (error) throw new ApiError(401, "Invalid refresh token");
    if (payload.type !== "refresh") throw new ApiError(401, "Invalid token");
    const session = await sessionRepo.get(payload.jti);

    if (!session || session.revokedAt) {
      await sessionService.revokeChain(payload.jti);
      throw new ApiError(401, "revoke");
    }

    const jti = newJti();
    await sessionService.rotate({
      newJti: jti,
      oldJti: payload.jti,
      userId: session.userId,
    });
    const newAccessToken = signAccessToken(session.userId, jti);
    const newRefreshToken = signRefreshToken(session.userId, jti);

    return { newAccessToken, newRefreshToken };
  },

  async activateAccount(code: string) {
    const [selector, validator] = code.split(".");
    if (!selector || !validator) throw new ApiError(400, "Invalid activation link");

    const token = await authRepo.findBySelector(selector);
    if (!token) throw new ApiError(400, "Invalid activation link");
    if (token.usedAt) throw new ApiError(409, "Activation link already used");
    if (token.expiresAt < new Date()) throw new ApiError(410, "Activation link expired");

    if (sha256(validator) !== token.tokenHash) throw new ApiError(400, "Invalid activation link");

    await Promise.all([
      authRepo.markUsed(token.id),
      userRepo.actvateById(token.userId),
      authRepo.revokeOtherTokens(token.userId, token.id),
    ]);
  },

  async logout(refreshToken: string | undefined) {
    if (!refreshToken) return;
    const [payload, error] = verifyRefreshToken(refreshToken);
    if (error) return;
    const session = await sessionRepo.get(payload.jti);
    if (!session) return;
    if (!session.revokedAt) await sessionRepo.revokeAllByUserId(session.userId);
    return;
  },

  async logoutAll(refreshToken: string) {
    const [payload, error] = verifyRefreshToken(refreshToken);
    if (error) throw new ApiError(401, "Invalid refresh token");
    await sessionRepo.revokeAllByUserId(payload.sub);
  },
};

async function sendActivationEmail({ userId, fullName, email }: ISendActivationMail) {
  const selector = randHex(8);
  const validator = randHex(32);
  const expiresAt = new Date(Date.now() + Number(ACTIVATION_TOKEN_TTL_HOURS) * 60 * 60 * 1000);

  await authRepo.createActivationToken({ userId, selector, validator, expiresAt });

  const link = `${CLIENT_URL}/auth/activation?code=${selector}.${validator}`;
  try {
    const html = await renderMail("activation-email", { activation_link: link, fullName, client_url: CLIENT_URL });
    await sendMail({
      from: "acara-test@zohomail.com",
      to: email,
      subject: "PRIMA User Activation",
      html,
    });
  } catch (e) {
    const error = e as Error;
    console.log("error: ", error.message);
    throw new ApiError(500, error.message);
  }
}
