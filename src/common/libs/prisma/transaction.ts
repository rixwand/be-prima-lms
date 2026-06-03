import { prisma, PrismaTransaction } from "./index";

type TransactionFn<T> = (tx: PrismaTransaction) => Promise<T>;

export async function withTransaction<T>(fn: TransactionFn<T>): Promise<T> {
  return prisma.$transaction(
    async tx => {
      return fn(tx);
    },
    { timeout: 30000 },
  );
}
