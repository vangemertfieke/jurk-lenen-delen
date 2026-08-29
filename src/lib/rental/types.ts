/**
 * Domeinmodel voor de DressLoop huurbescherming.
 *
 * Deze types zijn bewust 1-op-1 te mappen op toekomstige Supabase-tabellen
 * (rentals, rental_events, rental_evidence, claims, claim_decisions, audit_log).
 * Alle geldbewegingen worden later server-side afgehandeld via Stripe Connect;
 * de frontend houdt uitsluitend interne statussen bij.
 */

/* ---------------------------------- huur ---------------------------------- */

export type RentalFlowStatus =
  | "pending_payment"
  | "paid"
  | "confirmed"
  | "preparing"
  | "ready_for_pickup"
  | "shipped_to_renter"
  | "received_by_renter"
  | "rental_active"
  | "return_due"
  | "return_overdue"
  | "return_started"
  | "shipped_to_owner"
  | "returned_to_owner"
  | "inspection_period"
  | "completed"
  | "cancelled"
  | "problem_reported"
  | "claim_open"
  | "claim_resolved"
  | "payout_pending"
  | "paid_out";

export type DeliveryMethod = "pickup" | "shipping";

/* -------------------------------- betaling -------------------------------- */

export type PaymentStatus =
  | "payment_pending"
  | "payment_succeeded"
  | "payment_failed"
  | "refund_pending"
  | "refunded";

export type PayoutStatus =
  | "not_eligible"
  | "pending"
  | "eligible"
  | "processing"
  | "paid"
  | "failed"
  | "on_hold";

export type DepositStatus =
  | "required"
  | "pending"
  | "secured"
  | "release_pending"
  | "released"
  | "claim_hold"
  | "partially_claimed"
  | "fully_claimed";

/** Bedragen worden vastgelegd op het moment van boeken (snapshot). */
export interface RentalPayment {
  status: PaymentStatus;
  /** Huurprijs (of geaccepteerd bod). */
  rentalAmount: number;
  serviceFee: number;
  shippingFee: number;
  depositAmount: number;
  /** Totaal dat de huurder betaalt, inclusief borg. */
  totalCharged: number;
  /** Commissie DressLoop over de huurprijs. */
  commissionRate: number;
  commissionAmount: number;
  /** Bedrag dat de verhuurder na afronding krijgt. */
  ownerPayoutAmount: number;
  depositStatus: DepositStatus;
  /** Bedrag dat na een claim is ingehouden op de borg. */
  depositClaimedAmount: number;
  payoutStatus: PayoutStatus;
  /** Placeholders voor Stripe Connect (server-side gevuld). */
  stripePaymentIntentId?: string | null;
  stripeTransferId?: string | null;
  stripeAccountId?: string | null;
  paidAt?: string | null;
  payoutAt?: string | null;
}

/* -------------------------------- verzending ------------------------------- */

export type TrackingStatus =
  | "not_created"
  | "label_created"
  | "in_transit"
  | "delivered"
  | "exception"
  | "lost";

export interface ShipmentLeg {
  provider: string | null;
  trackingNumber: string | null;
  labelUrl: string | null;
  status: TrackingStatus;
  lastEvent?: string | null;
  lastEventAt?: string | null;
}

export interface RentalShipping {
  outbound: ShipmentLeg;
  inbound: ShipmentLeg;
}

/* ---------------------------------- bewijs --------------------------------- */

export type EvidenceStage =
  | "before_handover"
  | "received_by_renter"
  | "before_return"
  | "received_by_owner"
  | "claim_evidence";

export interface RentalEvidence {
  id: string;
  rentalId: string;
  uploadedBy: string;
  uploadedByRole: "owner" | "renter" | "admin";
  evidenceType: "photo" | "note";
  image: string;
  caption: string;
  stage: EvidenceStage;
  /** Originele uploadtijd — wordt nooit overschreven. */
  createdAt: string;
}

/* ---------------------------------- claims --------------------------------- */

export type ProblemReason =
  | "stain"
  | "damage"
  | "missing_part"
  | "not_as_described"
  | "wrong_dress"
  | "not_received"
  | "not_returned"
  | "late_return"
  | "package_lost"
  | "other";

export type ClaimStatus =
  | "reported"
  | "awaiting_other_party"
  | "evidence_collection"
  | "under_review"
  | "resolved_renter"
  | "resolved_owner"
  | "resolved_split"
  | "closed";

export type ClaimDecisionType =
  | "no_compensation"
  | "partial_compensation"
  | "compensation_from_deposit"
  | "deposit_returned"
  | "deposit_partially_returned"
  | "deposit_withheld"
  | "payout_approved"
  | "payout_adjusted"
  | "refund_partial"
  | "refund_full"
  | "escalate";

export interface ClaimResponse {
  by: string;
  role: "owner" | "renter";
  agrees: boolean | null;
  text: string;
  at: string;
}

export interface Claim {
  id: string;
  rentalId: string;
  reportedBy: string;
  reportedByRole: "owner" | "renter";
  reason: ProblemReason;
  description: string;
  requestedAmount: number | null;
  status: ClaimStatus;
  priority: "normal" | "high";
  evidenceIds: string[];
  responses: ClaimResponse[];
  adminNotes: string[];
  decision: {
    type: ClaimDecisionType;
    amount: number | null;
    note: string;
    decidedAt: string;
    decidedBy: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

/* -------------------------------- audit log -------------------------------- */

export type AuditActor = "renter" | "owner" | "system" | "admin";

export interface AuditEntry {
  id: string;
  rentalId: string;
  actor: AuditActor;
  actorId: string;
  action: string;
  /** Korte, gebruikersvriendelijke omschrijving. */
  label: string;
  meta?: Record<string, string | number | null>;
  at: string;
}

/* ---------------------------------- rental --------------------------------- */

export interface ProtectedRental {
  id: string;
  dressId: string;
  renterId: string;
  ownerId: string;
  /** Huurperiode. */
  startDate: string;
  endDate: string;
  /** Uiterste retourdatum (kan afwijken bij verzending). */
  returnDueDate: string;
  delivery: DeliveryMethod;
  status: RentalFlowStatus;
  /** Waarde-informatie van de jurk, gebruikt voor borgberekening. */
  dressValue: {
    originalPrice: number;
    estimatedValue: number;
    /** Gemarkeerd voor handmatige controle bij onrealistische waarde. */
    flaggedForReview: boolean;
  };
  pickup?: {
    approximateLocation: string;
    exactAddress: string;
    /** Exact adres wordt pas vrijgegeven vanaf een passende status. */
    addressReleased: boolean;
  };
  payment: RentalPayment;
  shipping: RentalShipping;
  evidence: RentalEvidence[];
  audit: AuditEntry[];
  claimId: string | null;
  /** Einde van de controleperiode voor de verhuurder. */
  inspectionDeadline: string | null;
  reviewAllowed: boolean;
  createdAt: string;
  updatedAt: string;
}

export type RentalRole = "renter" | "owner";
