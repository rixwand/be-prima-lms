import crypto from "crypto";
import { isUniqueConstraintError } from "./error";
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"`]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function randomSuffix(length = 5): string {
  return crypto
    .randomBytes(Math.ceil(length / 2))
    .toString("hex")
    .slice(0, length);
}

export async function createWithUniqueSlug<T>(
  tryCreate: (candidateSlug: string) => Promise<T>,
  baseSlug: string,
  maxTries = 5
): Promise<T> {
  let attempt = 0;

  while (attempt < maxTries) {
    const candidate = attempt === 0 ? baseSlug : `${baseSlug}-${randomSuffix()}`;
    try {
      return await tryCreate(candidate);
    } catch (err) {
      if (!isUniqueConstraintError(err)) throw err;

      const target = (err.meta as any)?.target as string[] | string | undefined;
      const isSlugCollision = Array.isArray(target) ? target.includes("slug") : target === "slug";

      if (!isSlugCollision) throw err;

      attempt += 1;
      continue;
    }
  }

  throw new Error("Failed to generate a unique slug after multiple attempts.");
}
