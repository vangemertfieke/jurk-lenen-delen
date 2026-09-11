import { useSyncExternalStore } from "react";
import type { DeliveryMethod } from "./config";

/**
 * Reserveringsverzoeken: de stap tussen "jurk en levering gekozen" en betalen.
 * De verhuurder bevestigt eerst; pas daarna kan de huurder afrekenen.
 */
export type ReservationStatus = "wacht_op_verhuurder" | "bevestigd" | "afgewezen" | "geannuleerd";

export interface Reservation {
  id: string;
  dressId: string;
  from: string;
  to: string;
  delivery: DeliveryMethod;
  message: string;
  status: ReservationStatus;
  createdAt: string;
}

const KEY = "borro.reservations.v1";
const EVENT = "borro:reservations";

let cache: Reservation[] = [];
let cacheRaw: string | null = null;
const emptySnapshot: Reservation[] = [];

function read(): Reservation[] {
  if (typeof window === "undefined") return emptySnapshot;
  const raw = window.localStorage.getItem(KEY);
  if (raw === cacheRaw) return cache;
  cacheRaw = raw;
  try {
    cache = raw ? (JSON.parse(raw) as Reservation[]) : [];
  } catch {
    cache = [];
  }
  return cache;
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

function write(next: Reservation[]) {
  window.localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(EVENT));
}

export function createReservation(input: {
  dressId: string;
  from: string;
  to: string;
  delivery: DeliveryMethod;
  message: string;
}): Reservation {
  const reservation: Reservation = {
    id: `res-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    ...input,
    status: "wacht_op_verhuurder",
    createdAt: new Date().toISOString(),
  };
  write([reservation, ...read()]);
  return reservation;
}

export function setReservationStatus(id: string, status: ReservationStatus) {
  write(read().map((r) => (r.id === id ? { ...r, status } : r)));
}

export function useReservations(): Reservation[] {
  return useSyncExternalStore(subscribe, read, () => emptySnapshot);
}

export const reservationLabels: Record<ReservationStatus, string> = {
  wacht_op_verhuurder: "Wacht op bevestiging verhuurder",
  bevestigd: "Bevestigd door verhuurder",
  afgewezen: "Afgewezen",
  geannuleerd: "Geannuleerd",
};
