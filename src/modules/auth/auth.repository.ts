import { prisma } from "../../common/libs/prisma";
import { sha256 } from "../../common/utils/hash";
import { IActivationTokenCreate } from "./auth.types";

export const authRepo = {
  async createActivationToken({ expiresAt, selector, userId, validator }: IActivationTokenCreate) {
    return prisma.activationToken.create({
      data: {
        userId,
        selector,
        tokenHash: sha256(validator),
        expiresAt,
      },
      select: {
        id: true,
      },
    });
  },

  async findBySelector(selector: string) {
    return prisma.activationToken.findUnique({ where: { selector } });
  },

  async markUsed(id: string) {
    return prisma.activationToken.update({ where: { id }, data: { usedAt: new Date() } });
  },

  async revokeOtherTokens(userId: number, exceptId: string) {
    return prisma.activationToken.updateMany({
      where: {
        userId,
        usedAt: null,
        id: { not: exceptId },
      },
      data: {
        usedAt: new Date(),
      },
    });
  },
};
