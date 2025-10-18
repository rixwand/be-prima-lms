export type DiscountType = "FIXED" | "PERCENTAGE";
export type IUpdateDiscount = {
  id: number;
  label?: string;
  type: DiscountType;
  value: number;
  startAt?: Date;
  endAt?: Date;
};
