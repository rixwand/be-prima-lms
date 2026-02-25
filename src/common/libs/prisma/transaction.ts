import { prisma, PrismaTx } from "./index";

type TransactionFn<T> = (tx: PrismaTx) => Promise<T>;

export async function withTransaction<T>(fn: TransactionFn<T>): Promise<T> {
  return prisma.$transaction(
    async tx => {
      return fn(tx);
    },
    { timeout: 10000 },
  );
}
