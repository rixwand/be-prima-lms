import { Prisma } from "@prisma/client";
import * as yup from "yup";
export function formatYupError(err: yup.ValidationError) {
  const errors: Record<string, string> = {};
  err.inner.forEach(e => {
    if (e.path && !errors[e.path]) {
      errors[e.path] = e.message;
    }
  });
  return errors;
}

export function isUniqueConstraintError(err: unknown): err is Prisma.PrismaClientKnownRequestError {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002";
}
