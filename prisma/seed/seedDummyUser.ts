import { PrismaClient } from "@prisma/client";
import { CLIENT_URL } from "../../src/common/utils/env";
import { hashPassword } from "../../src/common/utils/hash";
import { capitalizeWords } from "../../src/common/utils/string";
import { AUTH } from "../../src/config";
import { IUserCreateEntity } from "../../src/modules/users/user.types";

export default async function seedDummyUser(prisma: PrismaClient) {
  try {
    const users = [
      { name: "user0", role: AUTH.ROLES.MEMBER },
      { name: "lecturer", role: AUTH.ROLES.LECTURER },
      { name: "admin", role: AUTH.ROLES.ADMIN },
    ];
    const data: Omit<IUserCreateEntity & { role: string }, "roleId">[] = await Promise.all(
      users.map(async ({ name: user, role }) => ({
        email: user + "@mail.com",
        fullName: capitalizeWords(user),
        username: user,
        passwordHash: await hashPassword(user + "123"),
        profilePict: `${CLIENT_URL}/images/user.jpg`,
        role,
      })),
    );
    await Promise.all(
      data.map(({ role, ...userData }) =>
        prisma.user.upsert({
          where: { username: userData.username },
          create: { ...userData, role: { connect: { name: role } } },
          update: {},
        }),
      ),
    );
    console.log("✅ User seeded");
  } catch (e) {
    throw e;
  }
}
