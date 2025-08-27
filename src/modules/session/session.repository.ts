import { prisma } from "../../common/libs/prisma";
import { IRSCreateEntity, IRSRotateEntity } from "./session.types";
export const RefreshSessionRepo = {
  async create(data: IRSCreateEntity) {
    await prisma.refreshSession.create({ data });
  },

  async get(jti: string) {
    return prisma.refreshSession.findUnique({ where: { jti } });
  },

  async rotate({ userId, oldJti, newJti, expiresAt }: IRSRotateEntity) {
    return prisma.$transaction(async trx => {
      await trx.refreshSession.create({
        data: {
          userId,
          jti: newJti,
          expiresAt,
        },
      });

      await trx.refreshSession.update({
        where: { jti: oldJti },
        data: {
          revokedAt: new Date(),
          replacedByJti: newJti,
        },
      });
    });
  },

  async revokeMany(jtis: string[], revokedAt: Date) {
    return prisma.$transaction(async trx => {
      const { count } = await trx.refreshSession.updateMany({
        where: { jti: { in: jtis } },
        data: { revokedAt },
      });
      return count;
    });
  },
};
