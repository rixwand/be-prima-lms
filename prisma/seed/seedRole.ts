import { PrismaClient } from "@prisma/client";
import { AUTH } from "../../src/config";
export async function seedRole(prisma: PrismaClient) {
  for (const role of Object.values(AUTH.ROLES)) {
    await prisma.role.upsert({
      where: { name: role },
      update: {}, // no update needed
      create: { name: role },
    });
  }

  console.log("✅ Roles seeded");
}
