import { CourseDiscount, Prisma } from "@prisma/client";

export const calculateFinalPrice = ({
  basePrice,
  discounts,
  codeDiscount,
}: {
  basePrice: number;
  discounts?: CourseDiscount[];
  codeDiscount?: CourseDiscount;
}) => {
  const activeDiscounts = discounts?.filter(d => d.isActive);
  if (!activeDiscounts?.length) return basePrice;

  const zero = new Prisma.Decimal(0);
  let current = new Prisma.Decimal(basePrice);

  for (const d of activeDiscounts) {
    const amount = d.type === "FIXED" ? d.value : current.mul(d.value).div(100);
    current = Prisma.Decimal.max(zero, current.minus(amount));
  }
  if (codeDiscount) {
    const amount = codeDiscount.type === "FIXED" ? codeDiscount.value : current.mul(codeDiscount.value).div(100);
    current = Prisma.Decimal.max(zero, current.minus(amount));
  }
  return current.toNumber();
};
