export type Size = "XS" | "S" | "M" | "L" | "XL";
export type Occasion =
  | "Bruiloft"
  | "Gala"
  | "Festival"
  | "Diner"
  | "Feest"
  | "Vakantie";
export type Condition = "Nieuw met label" | "Zo goed als nieuw" | "Goed" | "Gedragen";
export type Delivery = "pickup" | "shipping" | "both";

export interface Profile {
  id: string;
  firstName: string;
  city: string;
  avatar: string;
  rating: number;
  completedRentals: number;
  memberSince: string;
  isBusiness?: boolean;
}

export interface Dress {
  id: string;
  brand: string;
  title: string;
  size: Size;
  color: string;
  condition: Condition;
  occasion: Occasion;
  fit: string;
  /** Basisprijs voor 4 dagen. */
  basePrice: number;
  deposit: number;
  images: string[];
  city: string;
  area: string;
  delivery: Delivery;
  description: string;
  ownerId: string;
  rating: number;
  reviewCount: number;
  allowsOffers: boolean;
  createdAt: string;
  status?: "published" | "draft";
}

export type RentalStatus =
  | "aanvraag"
  | "aankomend"
  | "actief"
  | "retourneren"
  | "afgerond"
  | "geannuleerd";

export interface Rental {
  id: string;
  dressId: string;
  renterId: string;
  ownerId: string;
  from: string;
  to: string;
  price: number;
  delivery: "pickup" | "shipping";
  status: RentalStatus;
  nextAction: string;
  depositStatus: "gereserveerd" | "wordt terugbetaald" | "terugbetaald" | "probleem gemeld";
}

export interface Offer {
  id: string;
  dressId: string;
  amount: number;
  from: string;
  to: string;
  status: "verstuurd" | "geaccepteerd" | "geweigerd" | "tegenbod";
  createdAt: string;
}

export interface Message {
  id: string;
  authorId: string | "system";
  text: string;
  at: string;
}

export interface Conversation {
  id: string;
  dressId: string;
  withProfileId: string;
  from: string;
  to: string;
  price: number;
  messages: Message[];
}

export interface Review {
  id: string;
  authorName: string;
  authorAvatar: string;
  rating: number;
  text: string;
  date: string;
  dressTitle: string;
}

export interface AppNotification {
  id: string;
  type:
    | "bericht"
    | "bod"
    | "boeking"
    | "verzending"
    | "retour"
    | "uitbetaling"
    | "review";
  title: string;
  body: string;
  at: string;
  read: boolean;
}
