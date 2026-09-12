import type { Dress } from "./types";

/**
 * Afhaal- en bezorguren per jurk. De verhuurder bepaalt wanneer een jurk
 * opgehaald of bezorgd/verstuurd kan worden. Zolang er nog geen eigen tijden
 * zijn ingesteld, gelden de standaardvensters hieronder.
 */
export interface HandoverWindow {
  /** Bijv. "Ma – vr" of "Zaterdag". */
  days: string;
  /** Bijv. "17:00 – 21:00". */
  hours: string;
}

export interface HandoverHours {
  pickup: HandoverWindow[];
  delivery: HandoverWindow[];
  /** Extra toelichting van de verhuurder. */
  note?: string;
}

const DEFAULT_PICKUP: HandoverWindow[] = [
  { days: "Ma – vr", hours: "17:00 – 21:00" },
  { days: "Za – zo", hours: "10:00 – 18:00" },
];

const DEFAULT_DELIVERY: HandoverWindow[] = [
  { days: "Ma – vr", hours: "Verstuurd voor 16:00, volgende werkdag in huis" },
];

const BY_DRESS: Record<string, Partial<HandoverHours>> = {
  d1: {
    pickup: [
      { days: "Ma – do", hours: "18:00 – 21:00" },
      { days: "Vrijdag", hours: "09:00 – 12:00" },
    ],
    delivery: [{ days: "Ma – vr", hours: "Verstuurd voor 15:00, morgen in huis" }],
    note: "Ophalen bij mij thuis, vlak bij station Amsterdam Zuid.",
  },
  d2: {
    delivery: [{ days: "Ma – za", hours: "Verstuurd voor 17:00 met Track & Trace" }],
  },
  d3: {
    pickup: [
      { days: "Wo – vr", hours: "16:00 – 20:00" },
      { days: "Zaterdag", hours: "11:00 – 15:00" },
    ],
    note: "Ophalen in Kralingen, parkeren kan voor de deur.",
  },
  d4: {
    pickup: [{ days: "Di – zo", hours: "12:00 – 20:00" }],
    delivery: [{ days: "Ma – vr", hours: "Bezorgd in Den Haag tussen 18:00 – 21:00" }],
  },
  d5: {
    pickup: [{ days: "Ma – zo", hours: "09:00 – 22:00" }],
    note: "Flexibel met tijden, stuur gerust een bericht.",
  },
  d6: {
    pickup: [{ days: "Ma – vr", hours: "17:30 – 20:30" }],
  },
  d7: {
    pickup: [{ days: "Do – zo", hours: "10:00 – 19:00" }],
  },
  d8: {
    delivery: [{ days: "Ma – vr", hours: "Verstuurd voor 14:00 in kledinghoes" }],
  },
};

export function handoverHoursFor(dress: Dress): HandoverHours {
  const custom = BY_DRESS[dress.id] ?? {};
  const hours: HandoverHours = {
    pickup: custom.pickup ?? DEFAULT_PICKUP,
    delivery: custom.delivery ?? DEFAULT_DELIVERY,
  };
  if (custom.note) hours.note = custom.note;
  return hours;
}

/** Keuzemomenten voor het reserveringsformulier. */
export function handoverSlots(dress: Dress, method: "pickup" | "shipping"): string[] {
  const hours = handoverHoursFor(dress);
  const windows = method === "pickup" ? hours.pickup : hours.delivery;
  return windows.map((w) => `${w.days} · ${w.hours}`);
}
