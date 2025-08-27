import * as dotenv from "dotenv";
import { defineConfig } from "prisma/config";

dotenv.config();

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "ts-node prisma/seed/index.ts",
    path: "prisma/migrations",
  },
});
