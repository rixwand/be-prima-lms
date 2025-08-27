import { PrismaClient } from "@prisma/client";
import { seedRole } from "./seedRole";

async function main() {
  const prisma = new PrismaClient();
  try {
    await seedRole(prisma);
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
