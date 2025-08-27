import { prisma } from "../../common/libs/prisma";
import { IGetRole } from "./role.types";

export const roleRepo = {
  async findByName(name: string): Promise<IGetRole | null> {
    return prisma.role.findUnique({ where: { name } });
  },
};
