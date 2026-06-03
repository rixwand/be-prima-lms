// RUN seed: npx prisma db seed

import { PrismaClient } from "@prisma/client";
import seedCategories from "./seedCategories";
import seedDummyUser from "./seedDummyUser";
import seedPermissionRoles from "./seedPermissionRole";

async function main() {
  const prisma = new PrismaClient();
  try {
    // await seedRole(prisma);
    console.log("Begin Seed.........");
    await seedPermissionRoles(prisma);
    await seedCategories(prisma);
    await seedDummyUser(prisma);
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
