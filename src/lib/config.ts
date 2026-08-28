/**
 * Centrale DressLoop configuratie.
 * Alle tarieven en percentages staan hier — nooit hardcoden in componenten.
 */
export const FEES = {
  /** Commissie die DressLoop inhoudt op de huuropbrengst van de verhuurder. */
  ownerCommissionRate: 0.1,
  /** Vaste servicekosten voor de huurder. */
  renterServiceFee: 1.99,
  /** Standaard verzendkosten. */
  shippingFee: 5.95,
  /** Standaard huurperiode in dagen waarvoor de basisprijs geldt. */
  baseRentalDays: 4,
  /** Toeslag per extra dag, als percentage van de basisprijs. */
  extraDayRate: 0.15,
} as const;

export type DeliveryMethod = "pickup" | "shipping";

export function formatEuro(value: number): string {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

export function formatDateNL(date: Date): string {
  return new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "long" }).format(date);
}

export function daysBetween(from: Date, to: Date): number {
  const ms = to.getTime() - from.getTime();
  return Math.max(1, Math.round(ms / 86_400_000) + 1);
}

/** Huurprijs voor een gekozen aantal dagen, op basis van de basisprijs (4 dagen). */
export function rentalPriceForDays(basePrice: number, days: number): number {
  const extra = Math.max(0, days - FEES.baseRentalDays);
  return round2(basePrice + extra * basePrice * FEES.extraDayRate);
}

export interface PriceBreakdownInput {
  basePrice: number;
  days?: number;
  delivery: DeliveryMethod;
  deposit?: number;
  /** Geaccepteerd bod vervangt de huurprijs. */
  agreedPrice?: number;
}

export interface PriceBreakdownResult {
  rental: number;
  serviceFee: number;
  shipping: number;
  deposit: number;
  total: number;
}

export function calculatePriceBreakdown({
  basePrice,
  days = FEES.baseRentalDays,
  delivery,
  deposit = 0,
  agreedPrice,
}: PriceBreakdownInput): PriceBreakdownResult {
  const rental = agreedPrice ?? rentalPriceForDays(basePrice, days);
  const shipping = delivery === "shipping" ? FEES.shippingFee : 0;
  const serviceFee = FEES.renterServiceFee;
  return {
    rental: round2(rental),
    serviceFee,
    shipping,
    deposit,
    total: round2(rental + serviceFee + shipping + deposit),
  };
}

export function calculateOwnerPayout(rental: number) {
  const commission = round2(rental * FEES.ownerCommissionRate);
  return { rental: round2(rental), commission, payout: round2(rental - commission) };
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}
