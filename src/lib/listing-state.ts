import { useSyncExternalStore } from "react";

/**
 * Zichtbaarheid van een plaatsing, door de verhuurder zelf te beheren.
 * "gepauzeerd" en "verwijderd" halen de jurk uit het openbare aanbod.
 */
export type ListingVisibility = "actief" | "gepauzeerd" | "verwijderd";

export type ListingStateMap = Record<string, ListingVisibility>;

const KEY = "borro.listing-state.v1";
const EVENT = "borro:listing-state";

let cache: ListingStateMap = {};
let cacheRaw: string | null = null;
const emptySnapshot: ListingStateMap = {};

function read(): ListingStateMap {
  if (typeof window === "undefined") return emptySnapshot;
  const raw = window.localStorage.getItem(KEY);
  if (raw === cacheRaw) return cache;
  cacheRaw = raw;
  try {
    cache = raw ? (JSON.parse(raw) as ListingStateMap) : {};
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

/** Zet de zichtbaarheid van een plaatsing en informeer alle luisteraars. */
export function setListingVisibility(id: string, state: ListingVisibility) {
  const next: ListingStateMap = { ...read() };
  if (state === "actief") delete next[id];
  else next[id] = state;
  window.localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(EVENT));
}

/** Huidige statuskaart van alle plaatsingen. */
export function useListingStates(): ListingStateMap {
  return useSyncExternalStore(subscribe, read, () => emptySnapshot);
}

export function visibilityOf(states: ListingStateMap, id: string): ListingVisibility {
  return states[id] ?? "actief";
}

/** Filtert jurken die de verhuurder heeft gepauzeerd of verwijderd. */
export function filterVisible<T extends { id: string }>(states: ListingStateMap, items: T[]): T[] {
  return items.filter((item) => visibilityOf(states, item.id) === "actief");
}
