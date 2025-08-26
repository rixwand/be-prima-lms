import { Prisma, User } from "@prisma/client";
import { prisma } from "../../common/libs/prisma";
import { ApiError } from "../../common/utils/http";
import { IUserCreateEntity, IUserGetEntity } from "./user.types";
const isUserEmailExist = (email: string) => {
  return prisma.user.count({ where: { email } });
};

export const userRepo = {
  async create(data: IUserCreateEntity) {
    const isDupl = await isUserEmailExist(data.email);
    if (isDupl) throw new ApiError(409, "This email is already registered");
    const res = await prisma.user.create({
      data,
      select: {
        username: true,
        email: true,
        fullName: true,
      },
    });
    return res;
  },

  async findByEmail(email: string): Promise<IUserGetEntity | null> {
    return prisma.user.findUnique({ where: { email } });
  },

  async findById<T extends Prisma.UserSelect | null | undefined>(
    id: number,
    select?: T
  ): Promise<T extends Prisma.UserSelect ? Prisma.UserGetPayload<{ select: T }> : User | null> {
    return prisma.user.findUnique({
      where: { id },
      select: select as any, // TS needs this cast
    }) as any;
  },
};
