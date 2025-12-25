import { Prisma } from "@prisma/client";
import * as yup from "yup";
export function formatYupError(err: yup.ValidationError) {
  const errors: Record<string, string> = {};

  if (err.inner.length === 0) {
    const path = err.path || "_error"; // fallback for object-level tests
    errors[path] = err.message;
    return errors;
  }

  err.inner.forEach(e => {
    const path = e.path || err.path || "_error";
    if (!errors[path]) {
      errors[path] = e.message;
    }
  });

  return errors;
}

export function isUniqueConstraintError(err: unknown): err is Prisma.PrismaClientKnownRequestError {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002";
}
