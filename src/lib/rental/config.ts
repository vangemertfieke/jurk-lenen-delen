import { FEES } from "@/lib/config";

/**
 * Centrale, configureerbare regels voor huurbescherming, borg en uitbetaling.
 * Nooit hardcoden in componenten — altijd via deze constanten en functies.
 */
export const PROTECTION_CONFIG = {
  /** Commissie DressLoop op de huuropbrengst (verhuurder). */
  commissionRate: FEES.ownerCommissionRate,
  /** Servicekosten huurder. */
  renterServiceFee: FEES.renterServiceFee,

  deposit: {
    min: 20,
    max: 100,
    /** Borg ≈ percentage van de geschatte waarde, afgerond op € 5. */
    rateOfValue: 0.25,
    roundTo: 5,
    /** Staffel die de uitkomst begrenst (waarde tot → borg). */
    tiers: [
      { upToValue: 100, deposit: 20 },
      { upToValue: 150, deposit: 35 },
      { upToValue: 200, deposit: 50 },
      { upToValue: 300, deposit: 75 },
      { upToValue: 500, deposit: 100 },
    ],
  },

  dressValue: {
    /** MVP: DressLoop ondersteunt jurken tot ongeveer dit bedrag. */
    supportedMax: 500,
    /** Boven deze waarde volgt handmatige controle. */
    reviewThreshold: 500,
    /** Onrealistisch lage/hoge invoer markeren. */
    minPlausible: 20,
  },

  /** Controleperiode voor de verhuurder na ontvangst van de retour (uren). */
  inspectionPeriodHours: 24,
  /** Coulancetermijn na de retourdeadline voordat "niet geretourneerd" kan (uren). */
  returnGraceHours: 48,
  /** Herinnering voor het einde van de huurperiode (uren). */
  returnReminderHours: 24,
  /** Aanbevolen minimum aantal conditiefoto's per stap. */
  minEvidencePhotos: 3,
} as const;

export function round2(n: number) {
  return Math.round(n * 100) / 100;
}

/**
 * Berekent de borg op basis van de geschatte waarde van de jurk.
 * Altijd via deze functie — willekeurige borgbedragen zijn niet toegestaan.
 */
export function calculateDeposit(estimatedValue: number): number {
  const { deposit } = PROTECTION_CONFIG;
  const value = Math.max(0, estimatedValue || 0);
  const tier = deposit.tiers.find((t) => value <= t.upToValue);
  const fromRate =
    Math.round((value * deposit.rateOfValue) / deposit.roundTo) * deposit.roundTo;
  const raw = tier ? Math.min(tier.deposit, Math.max(fromRate, deposit.min)) : deposit.max;
  return Math.min(deposit.max, Math.max(deposit.min, raw));
}

/** Markeert onwaarschijnlijke waarden voor handmatige controle (geen blokkade). */
export function isValueSuspicious(originalPrice: number, estimatedValue: number): boolean {
  const { dressValue } = PROTECTION_CONFIG;
  if (estimatedValue > dressValue.reviewThreshold) return true;
  if (estimatedValue < dressValue.minPlausible) return true;
  if (originalPrice > 0 && estimatedValue > originalPrice) return true;
  return false;
}

/** Uitbetaling aan de verhuurder na aftrek van commissie. */
export function calculateOwnerEarnings(rentalAmount: number) {
  const commissionAmount = round2(rentalAmount * PROTECTION_CONFIG.commissionRate);
  return {
    rentalAmount: round2(rentalAmount),
    commissionRate: PROTECTION_CONFIG.commissionRate,
    commissionAmount,
    payout: round2(rentalAmount - commissionAmount),
  };
}

export function addHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * 3_600_000);
}
