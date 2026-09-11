import { useSyncExternalStore } from "react";

/**
 * Eigen foto's die verhuurders uploaden bij hun jurk. Voorlopig lokaal
 * opgeslagen als data-URL; later te vervangen door bestandsopslag.
 */
export type ListingPhotoMap = Record<string, string[]>;

const KEY = "borro.listing-photos.v1";
const EVENT = "borro:listing-photos";

let cache: ListingPhotoMap = {};
let cacheRaw: string | null = null;
const emptySnapshot: ListingPhotoMap = {};

function read(): ListingPhotoMap {
  if (typeof window === "undefined") return emptySnapshot;
  const raw = window.localStorage.getItem(KEY);
  if (raw === cacheRaw) return cache;
  cacheRaw = raw;
  try {
    cache = raw ? (JSON.parse(raw) as ListingPhotoMap) : {};
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

function write(next: ListingPhotoMap) {
  window.localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(EVENT));
}

export function addListingPhoto(id: string, dataUrl: string) {
  const current = read();
  write({ ...current, [id]: [...(current[id] ?? []), dataUrl] });
}

export function removeListingPhoto(id: string, index: number) {
  const current = read();
  const list = (current[id] ?? []).filter((_, i) => i !== index);
  const next = { ...current, [id]: list };
  if (list.length === 0) delete next[id];
  write(next);
}

export function useListingPhotos(): ListingPhotoMap {
  return useSyncExternalStore(subscribe, read, () => emptySnapshot);
}

export function photosFor(map: ListingPhotoMap, id: string): string[] {
  return map[id] ?? [];
}
