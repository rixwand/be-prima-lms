import { PrismaClient } from "@prisma/client";

export async function seedRole(prisma: PrismaClient) {
  const roles = ["admin", "lecturer", "member"];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role },
      update: {}, // no update needed
      create: { name: role },
    });
  }

  console.log("✅ Roles seeded");
}
