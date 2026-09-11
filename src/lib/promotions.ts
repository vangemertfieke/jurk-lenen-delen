import { useSyncExternalStore } from "react";

/**
 * Promoot-opties die het Borro-team per jurk kan instellen.
 * - uitgelicht: krijgt voorrang op de homepage
 * - topZoekresultaat: staat bovenaan in de zoekresultaten
 */
export interface Promotion {
  uitgelicht?: boolean;
  topZoekresultaat?: boolean;
}

export type PromotionMap = Record<string, Promotion>;

const KEY = "borro.promotions.v1";
const EVENT = "borro:promotions";

let cache: PromotionMap = {};
let cacheRaw: string | null = null;
const emptySnapshot: PromotionMap = {};

function read(): PromotionMap {
  if (typeof window === "undefined") return emptySnapshot;
  const raw = window.localStorage.getItem(KEY);
  if (raw === cacheRaw) return cache;
  cacheRaw = raw;
  try {
    cache = raw ? (JSON.parse(raw) as PromotionMap) : {};
  } catch {
    cache = {};
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

export function setPromotion(id: string, patch: Promotion) {
  const current = read();
  const next: PromotionMap = { ...current, [id]: { ...current[id], ...patch } };
  const merged = next[id] as Promotion;
  if (!merged.uitgelicht && !merged.topZoekresultaat) delete next[id];
  window.localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(EVENT));
}

export function usePromotions(): PromotionMap {
  return useSyncExternalStore(subscribe, read, () => emptySnapshot);
}

export function promotionOf(map: PromotionMap, id: string): Promotion {
  return map[id] ?? {};
}

/** Sorteert gepromote jurken naar voren, met behoud van de bestaande volgorde. */
export function sortPromoted<T extends { id: string }>(
  map: PromotionMap,
  items: T[],
  key: keyof Promotion,
): T[] {
  return [...items].sort(
    (a, b) => Number(Boolean(map[b.id]?.[key])) - Number(Boolean(map[a.id]?.[key])),
  );
}
