import type {
  ClaimStatus,
  DepositStatus,
  PaymentStatus,
  PayoutStatus,
  ProblemReason,
  RentalFlowStatus,
  TrackingStatus,
} from "./types";

type Tone = "neutral" | "brand" | "success" | "warning";

/** Technische statussen worden nooit getoond — alleen deze labels. */
export const rentalStatusLabel: Record<RentalFlowStatus, string> = {
  pending_payment: "Betaling nog niet afgerond",
  paid: "Betaling gelukt",
  confirmed: "Boeking bevestigd",
  preparing: "Wordt klaargemaakt",
  ready_for_pickup: "Klaar om op te halen",
  shipped_to_renter: "Onderweg naar jou",
  received_by_renter: "Jurk ontvangen",
  rental_active: "Huurperiode actief",
  return_due: "Tijd om te retourneren",
  return_overdue: "Retour is te laat",
  return_started: "Retour gestart",
  shipped_to_owner: "Retour onderweg",
  returned_to_owner: "Jurk ontvangen door verhuurder",
  inspection_period: "Controleperiode",
  completed: "Afgerond",
  cancelled: "Geannuleerd",
  problem_reported: "Probleem gemeld",
  claim_open: "We bekijken het probleem",
  claim_resolved: "Probleem afgehandeld",
  payout_pending: "Uitbetaling in behandeling",
  paid_out: "Uitbetaald",
};

export const rentalStatusTone: Record<RentalFlowStatus, Tone> = {
  pending_payment: "warning",
  paid: "brand",
  confirmed: "brand",
  preparing: "brand",
  ready_for_pickup: "brand",
  shipped_to_renter: "brand",
  received_by_renter: "success",
  rental_active: "success",
  return_due: "warning",
  return_overdue: "warning",
  return_started: "brand",
  shipped_to_owner: "brand",
  returned_to_owner: "brand",
  inspection_period: "brand",
  completed: "success",
  cancelled: "neutral",
  problem_reported: "warning",
  claim_open: "warning",
  claim_resolved: "brand",
  payout_pending: "brand",
  paid_out: "success",
};

export const paymentStatusLabel: Record<PaymentStatus, string> = {
  payment_pending: "Betaling in behandeling",
  payment_succeeded: "Betaling gelukt",
  payment_failed: "Betaling mislukt",
  refund_pending: "Terugbetaling in behandeling",
  refunded: "Terugbetaald",
};

export const payoutStatusLabel: Record<PayoutStatus, string> = {
  not_eligible: "Nog niet van toepassing",
  pending: "In behandeling",
  eligible: "Klaar voor uitbetaling",
  processing: "Wordt verwerkt",
  paid: "Uitbetaald",
  failed: "Mislukt",
  on_hold: "Tijdelijk gepauzeerd",
};

export const depositStatusLabel: Record<DepositStatus, string> = {
  required: "Nog te reserveren",
  pending: "Wordt gereserveerd",
  secured: "Gereserveerd",
  release_pending: "Wordt teruggestort",
  released: "Terugbetaald",
  claim_hold: "Tijdelijk vastgehouden",
  partially_claimed: "Gedeeltelijk verrekend",
  fully_claimed: "Volledig verrekend",
};

export const trackingStatusLabel: Record<TrackingStatus, string> = {
  not_created: "Nog geen label",
  label_created: "Label aangemaakt",
  in_transit: "Onderweg",
  delivered: "Bezorgd",
  exception: "Vertraging gemeld",
  lost: "Pakket kwijt",
};

export const claimStatusLabel: Record<ClaimStatus, string> = {
  reported: "Gemeld",
  awaiting_other_party: "Wacht op reactie",
  evidence_collection: "Bewijs verzamelen",
  under_review: "We bekijken het probleem",
  resolved_renter: "Afgehandeld — in het voordeel van de huurder",
  resolved_owner: "Afgehandeld — in het voordeel van de verhuurder",
  resolved_split: "Afgehandeld — gedeeld",
  closed: "Gesloten",
};

export const problemReasonLabel: Record<ProblemReason, string> = {
  stain: "Vlek / vervuiling",
  damage: "Scheur / beschadiging",
  missing_part: "Onderdeel ontbreekt",
  not_as_described: "Jurk wijkt sterk af van advertentie",
  wrong_dress: "Verkeerde jurk ontvangen",
  not_received: "Jurk niet ontvangen",
  not_returned: "Jurk niet geretourneerd",
  late_return: "Retour te laat",
  package_lost: "Pakket kwijt tijdens verzending",
  other: "Anders",
};

export const evidenceStageLabel = {
  before_handover: "Voor de overdracht (verhuurder)",
  received_by_renter: "Bij ontvangst (huurder)",
  before_return: "Voor de retour (huurder)",
  received_by_owner: "Na de retour (verhuurder)",
  claim_evidence: "Bewijs bij melding",
} as const;

export function formatDateTimeNL(iso: string): string {
  return new Intl.DateTimeFormat("nl-NL", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}
