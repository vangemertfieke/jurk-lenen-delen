import dress1 from "@/assets/dress-1.jpg";
import dress2 from "@/assets/dress-2.jpg";
import dress3 from "@/assets/dress-3.jpg";
import dress4 from "@/assets/dress-4.jpg";
import dress5 from "@/assets/dress-5.jpg";
import hero from "@/assets/hero.jpg";
import type {
  AppNotification,
  Conversation,
  Dress,
  Offer,
  Profile,
  Rental,
  Review,
} from "./types";

/**
 * Mockdata-laag. Alle UI leest via deze functies, zodat een echte database
 * later achter dezelfde functies gekoppeld kan worden.
 */

export const profiles: Profile[] = [
  {
    id: "u1",
    firstName: "Sanne",
    city: "Amsterdam",
    avatar: "",
    rating: 4.9,
    completedRentals: 34,
    memberSince: "2024",
  },
  {
    id: "u2",
    firstName: "Lotte",
    city: "Utrecht",
    avatar: "",
    rating: 4.8,
    completedRentals: 21,
    memberSince: "2024",
  },
  {
    id: "u3",
    firstName: "Nadia",
    city: "Rotterdam",
    avatar: "",
    rating: 5,
    completedRentals: 12,
    memberSince: "2025",
  },
  {
    id: "u4",
    firstName: "Fleur",
    city: "Den Haag",
    avatar: "",
    rating: 4.7,
    completedRentals: 48,
    memberSince: "2023",
  },
  {
    id: "me",
    firstName: "Jij",
    city: "Amsterdam",
    avatar: "",
    rating: 5,
    completedRentals: 3,
    memberSince: "2026",
  },
];

const fallbackProfile: Profile = {
  id: "unknown",
  firstName: "Borro",
  city: "Nederland",
  avatar: "",
  rating: 5,
  completedRentals: 0,
  memberSince: "2026",
};

export const dresses: Dress[] = [
  {
    id: "d1",
    brand: "RAT & BOA",
    title: "Lucille maxi dress",
    size: "S",
    color: "Bordeaux",
    condition: "Zo goed als nieuw",
    occasion: "Bruiloft",
    fit: "Valt normaal",
    basePrice: 55,
    deposit: 50,
    images: [hero, dress2, dress4],
    city: "Amsterdam",
    area: "Amsterdam Zuid",
    delivery: "both",
    description:
      "Een tijdloze bordeauxrode maxi-jurk van zijde. Ik droeg hem één keer op een bruiloft in Toscane. De halterlijn is verstelbaar, waardoor de jurk mooi valt bij verschillende cupmaten. Wordt gestoomd en zorgvuldig verpakt verstuurd.",
    ownerId: "u1",
    rating: 4.8,
    reviewCount: 12,
    allowsOffers: true,
    createdAt: "2026-08-12",
  },
  {
    id: "d2",
    brand: "GANNI",
    title: "Satin slip gala dress",
    size: "M",
    color: "Zwart",
    condition: "Goed",
    occasion: "Gala",
    fit: "Valt klein",
    basePrice: 45,
    deposit: 40,
    images: [dress2, dress5],
    city: "Utrecht",
    area: "Utrecht Oost",
    delivery: "shipping",
    description:
      "Klassieke zwarte satijnen jurk met dunne bandjes. Perfect voor een gala of galadiner. Elegant en makkelijk te combineren.",
    ownerId: "u2",
    rating: 4.9,
    reviewCount: 8,
    allowsOffers: true,
    createdAt: "2026-08-20",
  },
  {
    id: "d3",
    brand: "REFORMATION",
    title: "Bloemenjurk Vera",
    size: "S",
    color: "Wit",
    condition: "Nieuw met label",
    occasion: "Vakantie",
    fit: "Valt normaal",
    basePrice: 35,
    deposit: 25,
    images: [dress3, dress1],
    city: "Rotterdam",
    area: "Rotterdam Kralingen",
    delivery: "pickup",
    description:
      "Luchtige bloemenjurk, ideaal voor een zomerse bruiloft of vakantie. Nooit gedragen, label zit er nog aan.",
    ownerId: "u3",
    rating: 5,
    reviewCount: 4,
    allowsOffers: false,
    createdAt: "2026-08-25",
  },
  {
    id: "d4",
    brand: "STINE GOYA",
    title: "Emerald wrap dress",
    size: "M",
    color: "Groen",
    condition: "Zo goed als nieuw",
    occasion: "Diner",
    fit: "Valt normaal",
    basePrice: 60,
    deposit: 60,
    images: [dress4, dress3],
    city: "Den Haag",
    area: "Den Haag Statenkwartier",
    delivery: "both",
    description:
      "Diepgroene zijden wikkeljurk met ballonmouwen. Een echte blikvanger voor een diner of feest.",
    ownerId: "u4",
    rating: 4.7,
    reviewCount: 16,
    allowsOffers: true,
    createdAt: "2026-07-30",
  },
  {
    id: "d5",
    brand: "ROTATE",
    title: "Sequin midi dress",
    size: "S",
    color: "Zilver",
    condition: "Goed",
    occasion: "Feest",
    fit: "Valt klein",
    basePrice: 50,
    deposit: 50,
    images: [dress5, dress2],
    city: "Amsterdam",
    area: "Amsterdam West",
    delivery: "both",
    description:
      "Zilveren paillettenjurk die alle aandacht trekt. Gedragen tijdens oud & nieuw, sindsdien professioneel gereinigd.",
    ownerId: "u1",
    rating: 4.6,
    reviewCount: 9,
    allowsOffers: true,
    createdAt: "2026-08-02",
  },
  {
    id: "d6",
    brand: "ARKET",
    title: "Roze midi jurk",
    size: "M",
    color: "Roze",
    condition: "Goed",
    occasion: "Diner",
    fit: "Valt ruim",
    basePrice: 30,
    deposit: 25,
    images: [dress1, dress3],
    city: "Utrecht",
    area: "Utrecht Centrum",
    delivery: "pickup",
    description:
      "Zachtroze midi-jurk met open rug. Comfortabel en veelzijdig, mooi bij zowel sneakers als hakken.",
    ownerId: "u2",
    rating: 4.8,
    reviewCount: 6,
    allowsOffers: true,
    createdAt: "2026-08-18",
  },
  {
    id: "d7",
    brand: "BA&SH",
    title: "Festivaljurk Nina",
    size: "L",
    color: "Wit",
    condition: "Gedragen",
    occasion: "Festival",
    fit: "Valt ruim",
    basePrice: 25,
    deposit: 20,
    images: [dress3, dress1],
    city: "Amsterdam",
    area: "Amsterdam Noord",
    delivery: "both",
    description:
      "Katoenen jurk met ruches, gedragen op twee festivals. Draagt heerlijk licht op warme dagen.",
    ownerId: "u1",
    rating: 4.5,
    reviewCount: 3,
    allowsOffers: true,
    createdAt: "2026-06-11",
  },
  {
    id: "d8",
    brand: "SELF-PORTRAIT",
    title: "Kanten galajurk",
    size: "XS",
    color: "Bordeaux",
    condition: "Zo goed als nieuw",
    occasion: "Gala",
    fit: "Valt normaal",
    basePrice: 75,
    deposit: 75,
    images: [hero, dress4],
    city: "Rotterdam",
    area: "Rotterdam Centrum",
    delivery: "shipping",
    description:
      "Kanten galajurk met fijne details. Eén keer gedragen tijdens een gala. Wordt in kledinghoes verstuurd.",
    ownerId: "u3",
    rating: 4.9,
    reviewCount: 11,
    allowsOffers: false,
    createdAt: "2026-08-27",
  },
];

export const myDrafts: Dress[] = dresses
  .filter((d) => d.id === "d6")
  .map((d) => ({
    ...d,
    id: "draft1",
    ownerId: "me",
    status: "draft" as const,
    title: "Zomerjurk (concept)",
  }));


export const rentals: Rental[] = [
  {
    id: "r1",
    dressId: "d1",
    renterId: "me",
    ownerId: "u1",
    from: "2026-09-12",
    to: "2026-09-15",
    price: 55,
    delivery: "pickup",
    status: "aankomend",
    nextAction: "Ophalen op vrijdag vanaf 17:00 in Amsterdam Zuid.",
    depositStatus: "gereserveerd",
  },
  {
    id: "r2",
    dressId: "d4",
    renterId: "me",
    ownerId: "u4",
    from: "2026-08-26",
    to: "2026-08-29",
    price: 60,
    delivery: "shipping",
    status: "actief",
    nextAction: "Retourneer uiterlijk zaterdag 29 augustus.",
    depositStatus: "gereserveerd",
  },
  {
    id: "r3",
    dressId: "d3",
    renterId: "me",
    ownerId: "u3",
    from: "2026-07-04",
    to: "2026-07-07",
    price: 35,
    delivery: "pickup",
    status: "afgerond",
    nextAction: "Laat een review achter voor Nadia.",
    depositStatus: "terugbetaald",
  },
  {
    id: "r4",
    dressId: "d2",
    renterId: "me",
    ownerId: "u2",
    from: "2026-10-02",
    to: "2026-10-05",
    price: 45,
    delivery: "shipping",
    status: "aanvraag",
    nextAction: "Wacht op reactie van Lotte.",
    depositStatus: "gereserveerd",
  },
];

/** Verhuur vanuit jouw kast (jij bent eigenaar). */
export const myRentalsOut: Rental[] = [
  {
    id: "o1",
    dressId: "d5",
    renterId: "u2",
    ownerId: "me",
    from: "2026-09-04",
    to: "2026-09-07",
    price: 50,
    delivery: "pickup",
    status: "aanvraag",
    nextAction: "Beoordeel de aanvraag van Lotte.",
    depositStatus: "gereserveerd",
  },
  {
    id: "o2",
    dressId: "d7",
    renterId: "u3",
    ownerId: "me",
    from: "2026-09-18",
    to: "2026-09-21",
    price: 25,
    delivery: "shipping",
    status: "aankomend",
    nextAction: "Verstuur de jurk uiterlijk 17 september.",
    depositStatus: "gereserveerd",
  },
  {
    id: "o3",
    dressId: "d6",
    renterId: "u4",
    ownerId: "me",
    from: "2026-08-14",
    to: "2026-08-17",
    price: 30,
    delivery: "pickup",
    status: "retourneren",
    nextAction: "Bevestig dat je de jurk goed hebt terugontvangen.",
    depositStatus: "wordt terugbetaald",
  },
];

export const offers: Offer[] = [
  {
    id: "b1",
    dressId: "d1",
    amount: 50,
    from: "2026-09-12",
    to: "2026-09-15",
    status: "geaccepteerd",
    createdAt: "2026-08-24",
  },
  {
    id: "b2",
    dressId: "d5",
    amount: 42,
    from: "2026-09-04",
    to: "2026-09-07",
    status: "verstuurd",
    createdAt: "2026-08-27",
  },
];

export const conversations: Conversation[] = [
  {
    id: "c1",
    dressId: "d1",
    withProfileId: "u1",
    from: "2026-09-12",
    to: "2026-09-15",
    price: 55,
    role: "huur",
    messages: [
      {
        id: "m1",
        authorId: "me",
        text: "Hoi Sanne! Is de jurk nog beschikbaar van 12 tot 15 september?",
        at: "24 aug 14:02",
      },
      {
        id: "m2",
        authorId: "u1",
        text: "Hoi! Ja hoor, die datums staan vrij. Ophalen kan bij mij in de buurt.",
        at: "24 aug 14:20",
      },
      {
        id: "m3",
        authorId: "system",
        text: "Je bod van € 50,00 is geaccepteerd.",
        at: "24 aug 15:01",
      },
    ],
  },
  {
    id: "c2",
    dressId: "d4",
    withProfileId: "u4",
    from: "2026-08-26",
    to: "2026-08-29",
    price: 60,
    role: "huur",
    messages: [
      {
        id: "m4",
        authorId: "u4",
        text: "De jurk is vandaag verstuurd, je ontvangt hem morgen.",
        at: "25 aug 09:11",
      },
      {
        id: "m5",
        authorId: "system",
        text: "De jurk is onderweg. Volg je huur in Mijn huuritems.",
        at: "25 aug 09:12",
      },
    ],
  },
  {
    id: "c3",
    dressId: "d2",
    withProfileId: "u2",
    from: "2026-10-02",
    to: "2026-10-05",
    price: 45,
    role: "verhuur",
    messages: [
      {
        id: "m6",
        authorId: "u2",
        text: "Hoi! Ik zou je jurk graag huren voor een bruiloft op 3 oktober. Kan ik hem ophalen?",
        at: "20 sep 18:44",
      },
      {
        id: "m7",
        authorId: "me",
        text: "Wat leuk! Ophalen kan, ik ben die donderdagavond thuis.",
        at: "20 sep 19:05",
      },
      {
        id: "m8",
        authorId: "system",
        text: "De reservering wacht op jouw bevestiging in Mijn verhuur.",
        at: "20 sep 19:06",
      },
    ],
  },
];

export const notifications: AppNotification[] = [
  {
    id: "n1",
    type: "bod",
    title: "Nieuw bod op Sequin midi dress",
    body: "Lotte biedt € 42,00 voor 4 t/m 7 september.",
    at: "Vandaag 09:12",
    read: false,
  },
  {
    id: "n2",
    type: "boeking",
    title: "Boeking bevestigd",
    body: "Je huur van Lucille maxi dress is bevestigd voor 12 – 15 september.",
    at: "Gisteren 18:40",
    read: false,
  },
  {
    id: "n3",
    type: "verzending",
    title: "Jurk verzonden",
    body: "Fleur heeft Emerald wrap dress verstuurd.",
    at: "25 aug",
    read: true,
  },
  {
    id: "n4",
    type: "retour",
    title: "Retour bevestigd",
    body: "Nadia heeft de retour bevestigd. Je borg wordt terugbetaald.",
    at: "8 jul",
    read: true,
  },
  {
    id: "n5",
    type: "uitbetaling",
    title: "Uitbetaling onderweg",
    body: "€ 27,00 wordt overgemaakt voor Roze midi jurk.",
    at: "18 aug",
    read: true,
  },
  {
    id: "n6",
    type: "review",
    title: "Laat een review achter",
    body: "Hoe was je huurervaring met Bloemenjurk Vera?",
    at: "9 jul",
    read: true,
  },
];

export const reviews: Review[] = [
  {
    id: "rev1",
    authorName: "Iris",
    authorAvatar: "",
    rating: 5,
    text: "De jurk zat perfect en was prachtig verpakt. Contact met Sanne verliep heel soepel.",
    date: "juli 2026",
    dressTitle: "Lucille maxi dress",
  },
  {
    id: "rev2",
    authorName: "Merel",
    authorAvatar: "",
    rating: 5,
    text: "Precies zoals op de foto's. Ophalen was zo geregeld, ik huur zeker weer.",
    date: "juni 2026",
    dressTitle: "Lucille maxi dress",
  },
  {
    id: "rev3",
    authorName: "Yasmin",
    authorAvatar: "",
    rating: 4,
    text: "Mooie jurk, viel iets ruimer dan verwacht. Verder helemaal top geregeld.",
    date: "mei 2026",
    dressTitle: "Lucille maxi dress",
  },
];

export const occasions = [
  "Bruiloft",
  "Gala",
  "Festival",
  "Diner",
  "Feest",
  "Vakantie",
] as const;
export const sizes = ["XS", "S", "M", "L", "XL"] as const;
export const colors = ["Bordeaux", "Zwart", "Wit", "Groen", "Zilver", "Roze"] as const;
export const brands = [
  "RAT & BOA",
  "GANNI",
  "REFORMATION",
  "STINE GOYA",
  "ROTATE",
  "ARKET",
  "BA&SH",
  "SELF-PORTRAIT",
] as const;
export const cities = ["Amsterdam", "Utrecht", "Rotterdam", "Den Haag"] as const;
export const conditions = [
  "Nieuw met label",
  "Zo goed als nieuw",
  "Goed",
  "Gedragen",
] as const;

/* ---- data access ---- */

/** Unieke buurten uit het huidige aanbod, alfabetisch. */
export function getAreas() {
  return [...new Set(dresses.map((d) => d.area))].sort((a, b) => a.localeCompare(b, "nl"));
}
export function getDresses() {
  return dresses;
}
export function getDress(id: string) {
  return dresses.find((d) => d.id === id) ?? [...dresses, ...myDrafts].find((d) => d.id === id);
}
export function getProfile(id: string) {
  return profiles.find((p) => p.id === id) ?? fallbackProfile;
}
export function getReviewsForDress(_dressId: string) {
  return reviews;
}
export function getConversation(id: string) {
  return conversations.find((c) => c.id === id);
}
export function getMyListings() {
  return dresses.filter((d) => d.ownerId === "u1").slice(0, 3);
}
