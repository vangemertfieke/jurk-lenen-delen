import { PROTECTION_CONFIG, addHours } from "./config";
import { rentalStatusLabel } from "./labels";
import type {
  AuditActor,
  AuditEntry,
  ProtectedRental,
  RentalFlowStatus,
  RentalRole,
} from "./types";

export function nowIso() {
  return new Date().toISOString();
}

export function makeId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function audit(
  rentalId: string,
  actor: AuditActor,
  actorId: string,
  action: string,
  label: string,
  meta?: Record<string, string | number | null>,
): AuditEntry {
  return {
    id: makeId("aud"),
    rentalId,
    actor,
    actorId,
    action,
    label,
    ...(meta ? { meta } : {}),
    at: nowIso(),
  };
}

/* --------------------------------- timeline -------------------------------- */

export interface TimelineStep {
  key: string;
  label: string;
  state: "done" | "current" | "todo";
}

const pickupFlow: { key: RentalFlowStatus; label: string }[] = [
  { key: "confirmed", label: "Boeking bevestigd" },
  { key: "paid", label: "Betaling ontvangen" },
  { key: "ready_for_pickup", label: "Klaar om op te halen" },
  { key: "received_by_renter", label: "Jurk overgedragen" },
  { key: "rental_active", label: "Huurperiode actief" },
  { key: "return_started", label: "Retourneren" },
  { key: "inspection_period", label: "Controle" },
  { key: "completed", label: "Afgerond" },
];

const shippingFlow: { key: RentalFlowStatus; label: string }[] = [
  { key: "confirmed", label: "Boeking bevestigd" },
  { key: "paid", label: "Betaling ontvangen" },
  { key: "shipped_to_renter", label: "Onderweg naar jou" },
  { key: "received_by_renter", label: "Jurk ontvangen" },
  { key: "rental_active", label: "Huurperiode actief" },
  { key: "shipped_to_owner", label: "Retour onderweg" },
  { key: "returned_to_owner", label: "Ontvangen door verhuurder" },
  { key: "inspection_period", label: "Controle" },
  { key: "completed", label: "Afgerond" },
];

/** Volgorde waarin statussen "gepasseerd" zijn, per bezorgmethode. */
const progressOrder: RentalFlowStatus[] = [
  "pending_payment",
  "paid",
  "confirmed",
  "preparing",
  "ready_for_pickup",
  "shipped_to_renter",
  "received_by_renter",
  "rental_active",
  "return_due",
  "return_overdue",
  "return_started",
  "shipped_to_owner",
  "returned_to_owner",
  "inspection_period",
  "completed",
  "payout_pending",
  "paid_out",
];

function rank(status: RentalFlowStatus) {
  const i = progressOrder.indexOf(status);
  return i === -1 ? 0 : i;
}

export function buildTimeline(rental: ProtectedRental): TimelineStep[] {
  const flow = rental.delivery === "pickup" ? pickupFlow : shippingFlow;
  const effective: RentalFlowStatus =
    rental.status === "claim_open" || rental.status === "problem_reported"
      ? "inspection_period"
      : rental.status === "claim_resolved"
        ? "completed"
        : rental.status;
  const current = rank(effective);
  let currentMarked = false;

  return flow.map((step) => {
    const r = rank(step.key);
    let state: TimelineStep["state"];
    if (r < current) state = "done";
    else if (!currentMarked && r <= current) {
      state = "current";
      currentMarked = true;
    } else state = "todo";
    if (rental.status === "completed" || rental.status === "paid_out") state = "done";
    return { key: step.key, label: step.label, state };
  });
}

/* -------------------------- wat gebeurt er hierna? ------------------------- */

export interface NextStep {
  /** Wat is er nu aan de hand. */
  status: string;
  /** Wat gebeurt er hierna. */
  next: string;
  /** Moet deze gebruiker iets doen? */
  actionRequired: boolean;
  /** Label voor de primaire knop, indien van toepassing. */
  action?: string;
}

export function getNextStep(rental: ProtectedRental, role: RentalRole): NextStep {
  const s = rental.status;
  const label = rentalStatusLabel[s];
  const pickup = rental.delivery === "pickup";

  const wait = (next: string): NextStep => ({ status: label, next, actionRequired: false });

  switch (s) {
    case "pending_payment":
      return role === "renter"
        ? { status: label, next: "Rond je betaling af om de boeking te bevestigen.", actionRequired: true, action: "Betaling afronden" }
        : wait("De huurder rondt de betaling af.");
    case "paid":
    case "confirmed":
    case "preparing":
      return role === "owner"
        ? {
            status: label,
            next: pickup
              ? "Maak de jurk klaar voor ophalen en voeg conditiefoto's toe."
              : "Maak je jurk klaar voor verzending en voeg conditiefoto's toe.",
            actionRequired: true,
            action: pickup ? "Jurk klaarmaken" : "Verzending voorbereiden",
          }
        : wait(pickup ? "De verhuurder maakt de jurk klaar om op te halen." : "De verhuurder maakt je jurk klaar voor verzending.");
    case "ready_for_pickup":
      return role === "renter"
        ? { status: label, next: "Haal de jurk op en controleer hem bij ontvangst.", actionRequired: true, action: "Ontvangst bevestigen" }
        : wait("De huurder haalt de jurk op.");
    case "shipped_to_renter":
      return role === "renter"
        ? { status: label, next: "Zodra je pakket binnen is: controleer de jurk en bevestig ontvangst.", actionRequired: true, action: "Ontvangst bevestigen" }
        : wait("De jurk is onderweg naar de huurder.");
    case "received_by_renter":
    case "rental_active":
      return role === "renter"
        ? wait(`Draag de jurk. Retourneren kan tot ${new Date(rental.returnDueDate).toLocaleDateString("nl-NL", { day: "numeric", month: "long" })}.`)
        : wait("De huurperiode loopt. Je ziet het hier zodra de retour start.");
    case "return_due":
      return role === "renter"
        ? { status: label, next: "Maak retourfoto's en start je retour.", actionRequired: true, action: "Start retour" }
        : wait("De huurder retourneert de jurk.");
    case "return_overdue":
      return role === "renter"
        ? { status: label, next: "Retourneer de jurk zo snel mogelijk en laat de verhuurder weten wanneer.", actionRequired: true, action: "Start retour" }
        : {
            status: label,
            next: "Nog niets ontvangen? Na de coulancetermijn kun je dit melden bij DressLoop.",
            actionRequired: true,
            action: "Jurk niet geretourneerd melden",
          };
    case "return_started":
      return role === "renter"
        ? pickup
          ? { status: label, next: "Breng de jurk terug en bevestig de teruggave.", actionRequired: true, action: "Jurk teruggebracht" }
          : { status: label, next: "Breng het pakket weg met het retourlabel.", actionRequired: true, action: "Pakket afgegeven" }
        : wait("De huurder is bezig met de retour.");
    case "shipped_to_owner":
      return role === "owner"
        ? { status: label, next: "Bevestig zodra het pakket bij je bezorgd is.", actionRequired: true, action: "Retour ontvangen" }
        : wait("Je retour is onderweg naar de verhuurder.");
    case "returned_to_owner":
    case "inspection_period":
      return role === "owner"
        ? {
            status: label,
            next: `Controleer de jurk binnen ${PROTECTION_CONFIG.inspectionPeriodHours} uur en bevestig of alles in orde is.`,
            actionRequired: true,
            action: "Alles is in orde",
          }
        : wait("De verhuurder controleert de jurk. Daarna wordt je borg teruggestort.");
    case "problem_reported":
    case "claim_open":
      return {
        status: label,
        next: "DressLoop bekijkt de melding. We vragen beide partijen om een reactie en bewijs.",
        actionRequired: true,
        action: "Reageer op de melding",
      };
    case "claim_resolved":
      return wait("De melding is afgehandeld. Je ziet de uitkomst bij deze huur.");
    case "completed":
    case "payout_pending":
    case "paid_out":
      return role === "renter"
        ? wait("Klaar. Je kunt nu een review achterlaten.")
        : wait("Klaar. Je uitbetaling wordt verwerkt.");
    case "cancelled":
      return wait("Deze boeking is geannuleerd.");
    default:
      return wait("");
  }
}

/** Exact adres wordt pas vrijgegeven vanaf een passende boekingsfase. */
export function isAddressReleased(rental: ProtectedRental): boolean {
  return ["paid", "confirmed", "preparing", "ready_for_pickup", "received_by_renter", "rental_active", "return_due", "return_started", "return_overdue"].includes(
    rental.status,
  );
}

export function inspectionDeadlineFrom(date = new Date()): string {
  return addHours(date, PROTECTION_CONFIG.inspectionPeriodHours).toISOString();
}

export function isReturnOverdue(rental: ProtectedRental): boolean {
  const due = new Date(rental.returnDueDate).getTime();
  const openStates: RentalFlowStatus[] = ["rental_active", "received_by_renter", "return_due"];
  return openStates.includes(rental.status) && Date.now() > due;
}

export function canReview(rental: ProtectedRental): boolean {
  return (
    (rental.status === "completed" ||
      rental.status === "paid_out" ||
      rental.status === "claim_resolved") &&
    rental.claimId === null
      ? true
      : rental.status === "claim_resolved"
  );
}
