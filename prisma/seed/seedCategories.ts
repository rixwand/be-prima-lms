import { PrismaClient } from "@prisma/client";
import { slugify } from "../../src/common/utils/course";

export default async function seedCategories(prisma: PrismaClient) {
  const categories = [
    "MS. Office",
    "Design Grafis",
    "Teknisi Komputer",
    "Bahasa Inggris",
    "Video Editing",
    "Web Development",
    "3D Desain",
  ];
  try {
    for (const name of categories) {
      if (!name) continue;
      await prisma.category.upsert({
        where: {
          slug: slugify(name),
        },
        update: {},
        create: { name, slug: slugify(name) },
      });
    }
    console.log("✅ Categories seeded");
  } catch (e) {
    throw e;
  }
}
