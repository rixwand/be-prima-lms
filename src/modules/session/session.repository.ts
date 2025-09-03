import { prisma } from "../../common/libs/prisma";
import { IRSCreateEntity, IRSRotateEntity } from "./session.types";
export const sessionRepo = {
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

  async revokeByJti(jti: string) {
    return prisma.refreshSession.update({
      where: { jti },
      data: {
        revokedAt: new Date(),
      },
    });
  },

  async revokeAllByUserId(userId: number) {
    return prisma.refreshSession.updateMany({
      where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
      data: {
        revokedAt: new Date(),
      },
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
