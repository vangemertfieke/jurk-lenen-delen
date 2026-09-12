/**
 * Eenvoudige afstandslaag voor het aanbod. Elke buurt heeft een benaderde
 * coördinaat; daarmee sorteren we zoekresultaten op afstand tot de gekozen
 * buurt of stad. Bij een echte koppeling komen deze coördinaten uit de
 * adresgegevens van de verhuurder.
 */

interface Point {
  lat: number;
  lng: number;
}

const AREA_COORDS: Record<string, Point> = {
  "Amsterdam Zuid": { lat: 52.3435, lng: 4.8721 },
  "Amsterdam West": { lat: 52.3746, lng: 4.8478 },
  "Amsterdam Noord": { lat: 52.3985, lng: 4.9165 },
  "Utrecht Centrum": { lat: 52.0907, lng: 5.1214 },
  "Utrecht Oost": { lat: 52.0854, lng: 5.1471 },
  "Rotterdam Centrum": { lat: 51.9225, lng: 4.4792 },
  "Rotterdam Kralingen": { lat: 51.9284, lng: 4.5153 },
  "Den Haag Statenkwartier": { lat: 52.0949, lng: 4.2762 },
};

const CITY_COORDS: Record<string, Point> = {
  Amsterdam: { lat: 52.3702, lng: 4.8952 },
  Utrecht: { lat: 52.0907, lng: 5.1214 },
  Rotterdam: { lat: 51.9244, lng: 4.4777 },
  "Den Haag": { lat: 52.0705, lng: 4.3007 },
};

function coordsFor(area: string, city?: string): Point | null {
  return AREA_COORDS[area] ?? (city ? (CITY_COORDS[city] ?? null) : null);
}

/** Hemelsbrede afstand in kilometers tussen twee plekken. */
export function distanceKm(
  a: { area: string; city?: string },
  b: { area: string; city?: string },
): number | null {
  const p1 = coordsFor(a.area, a.city);
  const p2 = coordsFor(b.area, b.city);
  if (!p1 || !p2) return null;
  const R = 6371;
  const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
  const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;
  const lat1 = (p1.lat * Math.PI) / 180;
  const lat2 = (p2.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Leesbare afstand, bijv. "1,2 km" of "12 km". */
export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 10) return `${km.toFixed(1).replace(".", ",")} km`;
  return `${Math.round(km)} km`;
}

/** Referentiepunt op basis van gekozen buurt of stad. */
export function referencePoint(
  area: string | null,
  city: string | null,
): { area: string; city?: string } | null {
  if (area) return { area };
  if (city) return { area: "", city };
  return null;
}
