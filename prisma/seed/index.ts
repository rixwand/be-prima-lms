// RUN seed: npx prisma db seed

import { PrismaClient } from "@prisma/client";
import seedPermissionRoles from "./seedPermissionRole";

async function main() {
  const prisma = new PrismaClient();
  try {
    // await seedRole(prisma);
    await seedPermissionRoles(prisma);
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
