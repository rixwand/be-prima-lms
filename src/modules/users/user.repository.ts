import { Prisma } from "@prisma/client";
import { prisma } from "../../common/libs/prisma";
import { ApiError } from "../../common/utils/http";
import { IUserCreateEntity, IUserGetEntity, IUserUpdate } from "./user.types";

type IncludeArg<I extends Prisma.UserInclude> = { include: I; select?: never };
type SelectArg<S extends Prisma.UserSelect> = { select: S; include?: never };

async function findById(id: number): Promise<Prisma.UserGetPayload<{}> | null>;

async function findById<I extends Prisma.UserInclude>(
  id: number,
  opts: IncludeArg<I>
): Promise<Prisma.UserGetPayload<{ include: I }> | null>;

async function findById<S extends Prisma.UserSelect>(
  id: number,
  opts: SelectArg<S>
): Promise<Prisma.UserGetPayload<{ select: S }> | null>;

// Implementation (note the union type matches the overload shapes)
async function findById(id: number, opts?: any) {
  if (opts && opts.select)
    return prisma.user.findUnique({
      where: { id },
      select: opts.select,
    });
  if (opts && opts.include)
    return prisma.user.findUnique({
      where: { id },
      include: opts.include,
    });
  else
    return prisma.user.findUnique({
      where: { id },
    });
}

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
        id: true,
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

  findById: findById,

  async actvateById(id: number) {
    return prisma.user.update({
      where: { id },
      data: { status: "ACTIVE" },
    });
  },

  async updateById<S extends Prisma.UserSelect>(
    id: number,
    data: IUserUpdate,
    select: S
  ): Promise<Prisma.UserGetPayload<{ select: S }>> {
    return prisma.user.update({
      where: { id },
      data: {
        ...(data.fullName ? { fullName: data.fullName } : {}),
        ...(data.profilePict ? { profilePict: data.profilePict } : {}),
      },
      select,
    });
  },

  async updatePassword(id: number, passwordHash: string) {
    return prisma.user.update({
      where: { id },
      data: { passwordHash },
    });
  },
};
