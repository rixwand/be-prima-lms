import { REFRESH_TTL_SEC } from "../../common/utils/env";
import { RefreshSessionRepo } from "./session.repository";
import { IRotateSession } from "./session.types";
export const SessionService = {
  async create(userId: number, jti: string) {
    const expiresAt = new Date(Date.now() + REFRESH_TTL_SEC * 1000);
    await RefreshSessionRepo.create({ userId, jti, expiresAt });
  },

  async rotate(data: IRotateSession) {
    const expiresAt = new Date(Date.now() + REFRESH_TTL_SEC * 1000);
    await RefreshSessionRepo.rotate({ ...data, expiresAt });
  },

  async revokeChain(jti: string) {
    const listed = new Set<string>();
    const toRevoke: string[] = [];
    let currSession = await RefreshSessionRepo.get(jti);

    while (currSession && !listed.has(currSession.jti)) {
      listed.add(currSession.jti);
      if (!currSession.revokedAt) toRevoke.push(currSession.jti);

      currSession = currSession.replacedByJti
        ? await RefreshSessionRepo.get(currSession.replacedByJti)
        : null;
    }
    if (toRevoke.length == 0) return 0;
    await RefreshSessionRepo.revokeMany(toRevoke, new Date());
  },
};
