import { Prisma } from "@prisma/client";
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

export async function withUniqueSlug<T>(
  tryCreate: (candidateSlug: string) => Promise<T>,
  baseSlug: string,
  maxTries = 5,
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

export function buildStatusWhere(status?: string): Prisma.CourseWhereInput {
  switch (status) {
    case "DRAFT":
      return {
        publishedAt: null,
        takenDownAt: null,
        publishRequest: null,
      };

    case "PENDING":
      return {
        publishRequest: { status: "PENDING" },
      };

    case "REJECTED":
      return {
        publishRequest: { status: "REJECTED" },
      };

    case "PUBLISHED":
      return {
        publishedAt: { not: null },
        takenDownAt: null,
        OR: [{ publishRequest: null }, { publishRequest: { status: "APPROVED" } }],
      };

    case "ARCHIVED":
      return {
        takenDownAt: { not: null },
      };

    default:
      return {};
  }
}

export const getCourseStatus = (course: {
  takenDownAt?: Date | null;
  publishRequest?: { status: string } | null;
  publishedAt?: Date | null;
}) => {
  if (course.takenDownAt) return "ARCHIVED";
  if (course.publishRequest?.status === "PENDING") return "PENDING";
  if (course.publishRequest?.status === "REJECTED") return "REJECTED";
  if (course.publishedAt) return "PUBLISHED";
  return "DRAFT";
};

export function isEmptyTipTapDoc(doc?: any | null): boolean {
  if (!doc || doc.type !== "doc") return true;

  if (!Array.isArray(doc.content)) return true;

  if (doc.content.length === 0) return true;
  return doc.content.every((c: any) => !Object.hasOwn(c, "content"));
}

export const comingSoonLesson = {
  type: "doc",
  content: [
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "Coming soon...",
        },
      ],
    },
  ],
};
