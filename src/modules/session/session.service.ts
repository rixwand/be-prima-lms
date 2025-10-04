import { REFRESH_TTL_SEC } from "../../common/utils/env";
import { sessionRepo } from "./session.repository";
import { IRotateSession } from "./session.types";
export const sessionService = {
  async create(userId: number, jti: string) {
    const expiresAt = new Date(Date.now() + REFRESH_TTL_SEC * 1000);
    await sessionRepo.create({ userId, jti, expiresAt });
    console.log("Creted a session with: ", jti + ":" + userId);
  },

  async rotate(data: IRotateSession) {
    const expiresAt = new Date(Date.now() + REFRESH_TTL_SEC * 1000);
    await sessionRepo.rotate({ ...data, expiresAt });
  },

  async revokeChain(jti: string) {
    const listed = new Set<string>();
    const toRevoke: string[] = [];
    let currSession = await sessionRepo.get(jti);

    while (currSession && !listed.has(currSession.jti)) {
      listed.add(currSession.jti);
      if (!currSession.revokedAt) toRevoke.push(currSession.jti);

      currSession = currSession.replacedByJti ? await sessionRepo.get(currSession.replacedByJti) : null;
    }
    if (toRevoke.length == 0) return 0;
    await sessionRepo.revokeMany(toRevoke, new Date());
  },
};
