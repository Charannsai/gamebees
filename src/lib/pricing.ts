export const LONG_RENTAL_DISCOUNTS: Record<number, number> = {
  14: 0.10,
  30: 0.20,
};

export function getLongRentalDiscountRate(days: number, settings?: Record<number, number>) {
  return (settings || LONG_RENTAL_DISCOUNTS)[days] || 0;
}

export function calculateRentalPricing(item: any, days: number, discountSettings?: Record<number, number>) {
  const safeDays = Math.max(1, Number(days) || 3);
  const baseRate = Number(item?.price_3_days) || Number(item?.price || 0) * 3;
  const extraRate = Number(item?.price_extra_day) || Number(item?.price || 0);
  const grossTotal = safeDays <= 3 ? baseRate : baseRate + (safeDays - 3) * extraRate;
  const discountRate = getLongRentalDiscountRate(safeDays, discountSettings);
  const rentalDiscount = Math.round(grossTotal * discountRate * 100) / 100;
  const total = Math.max(0, grossTotal - rentalDiscount);

  return {
    days: safeDays,
    baseRate,
    extraRate,
    grossTotal,
    discountRate,
    rentalDiscount,
    total,
    effectiveDailyRate: safeDays ? Math.round((total / safeDays) * 100) / 100 : 0,
  };
}
