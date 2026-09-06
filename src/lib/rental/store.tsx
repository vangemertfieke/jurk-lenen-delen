import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { inspectionDeadlineFrom, audit, makeId, nowIso } from "./engine";
import { seedClaims, seedRentals } from "./seed";
import type {
  Claim,
  ClaimDecisionType,
  ClaimStatus,
  EvidenceStage,
  ProblemReason,
  ProtectedRental,
  RentalEvidence,
  RentalFlowStatus,
  RentalRole,
} from "./types";

/**
 * Client-side huurstore (mock). De vorm van de acties is bewust gelijk aan de
 * toekomstige server functions: elke actie levert een statuswijziging plus een
 * auditregel op. Financiële afhandeling gebeurt later server-side (Stripe Connect).
 */

const RENTALS_KEY = "dressloop.rentals.v1";
const CLAIMS_KEY = "dressloop.claims.v1";

interface RentalStoreValue {
  rentals: ProtectedRental[];
  claims: Claim[];
  hydrated: boolean;
  getRental: (id: string) => ProtectedRental | undefined;
  getClaim: (id: string | null) => Claim | undefined;
  getClaimForRental: (rentalId: string) => Claim | undefined;
  roleFor: (rental: ProtectedRental) => RentalRole | "admin";
  addEvidence: (
    rentalId: string,
    stage: EvidenceStage,
    role: "owner" | "renter",
    captions: string[],
    images: string[],
  ) => void;
  advance: (rentalId: string, action: RentalAction, role: RentalRole) => void;
  reportProblem: (input: {
    rentalId: string;
    role: "owner" | "renter";
    reason: ProblemReason;
    description: string;
    requestedAmount: number | null;
    images: string[];
  }) => string;
  respondToClaim: (claimId: string, role: "owner" | "renter", agrees: boolean, text: string) => void;
  setClaimStatus: (claimId: string, status: ClaimStatus) => void;
  addAdminNote: (claimId: string, note: string) => void;
  resolveClaim: (
    claimId: string,
    decision: { type: ClaimDecisionType; amount: number | null; note: string },
  ) => void;
  resetDemo: () => void;
}

export type RentalAction =
  | "confirm_payment"
  | "mark_ready_for_pickup"
  | "mark_shipped"
  | "confirm_receipt"
  | "start_return"
  | "confirm_return_dropoff"
  | "confirm_return_received"
  | "complete_inspection";

const RentalContext = createContext<RentalStoreValue | null>(null);

/** Huidige gebruiker in de mockdata. */
export const CURRENT_USER_ID = "me";
const ADMIN_KEY = "dressloop.admin";

export function RentalProvider({ children }: { children: ReactNode }) {
  const [rentals, setRentals] = useState<ProtectedRental[]>(() => seedRentals());
  const [claims, setClaims] = useState<Claim[]>(() => seedClaims());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const r = localStorage.getItem(RENTALS_KEY);
      if (r) setRentals(JSON.parse(r) as ProtectedRental[]);
      const c = localStorage.getItem(CLAIMS_KEY);
      if (c) setClaims(JSON.parse(c) as Claim[]);
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  const persistRentals = useCallback((next: ProtectedRental[]) => {
    setRentals(next);
    try {
      localStorage.setItem(RENTALS_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, []);

  const persistClaims = useCallback((next: Claim[]) => {
    setClaims(next);
    try {
      localStorage.setItem(CLAIMS_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, []);

  const updateRental = useCallback(
    (id: string, fn: (r: ProtectedRental) => ProtectedRental) => {
      setRentals((prev) => {
        const next = prev.map((r) => (r.id === id ? { ...fn(r), updatedAt: nowIso() } : r));
        try {
          localStorage.setItem(RENTALS_KEY, JSON.stringify(next));
        } catch {
          /* ignore */
        }
        return next;
      });
    },
    [],
  );

  const addEvidence = useCallback<RentalStoreValue["addEvidence"]>(
    (rentalId, stage, role, captions, images) => {
      updateRental(rentalId, (r) => {
        const items: RentalEvidence[] = images.map((image, i) => ({
          id: makeId("ev"),
          rentalId,
          uploadedBy: role === "owner" ? r.ownerId : r.renterId,
          uploadedByRole: role,
          evidenceType: "photo",
          image,
          caption: captions[i] ?? "Conditiefoto",
          stage,
          createdAt: nowIso(),
        }));
        return {
          ...r,
          // Origineel bewijs wordt nooit overschreven — alleen toegevoegd.
          evidence: [...r.evidence, ...items],
          audit: [
            ...r.audit,
            audit(
              rentalId,
              role,
              role === "owner" ? r.ownerId : r.renterId,
              "evidence_uploaded",
              `${items.length} conditiefoto('s) toegevoegd`,
              { stage },
            ),
          ],
        };
      });
    },
    [updateRental],
  );

  const advance = useCallback<RentalStoreValue["advance"]>(
    (rentalId, action, role) => {
      updateRental(rentalId, (r) => {
        let status: RentalFlowStatus = r.status;
        let label = "";
        const payment = { ...r.payment };
        const shipping = {
          outbound: { ...r.shipping.outbound },
          inbound: { ...r.shipping.inbound },
        };
        let inspectionDeadline = r.inspectionDeadline;
        let reviewAllowed = r.reviewAllowed;

        switch (action) {
          case "confirm_payment":
            status = "confirmed";
            payment.status = "payment_succeeded";
            payment.depositStatus = "secured";
            payment.paidAt = nowIso();
            label = "Betaling gelukt";
            break;
          case "mark_ready_for_pickup":
            status = "ready_for_pickup";
            label = "Jurk klaar voor overdracht";
            break;
          case "mark_shipped":
            status = "shipped_to_renter";
            shipping.outbound.status = "in_transit";
            shipping.outbound.provider = shipping.outbound.provider ?? "PostNL";
            shipping.outbound.trackingNumber =
              shipping.outbound.trackingNumber ?? `3SMOCK${Math.floor(Math.random() * 1e7)}`;
            shipping.outbound.lastEvent = "Pakket afgegeven";
            shipping.outbound.lastEventAt = nowIso();
            label = "Jurk verzonden";
            break;
          case "confirm_receipt":
            status = "rental_active";
            shipping.outbound.status =
              r.delivery === "shipping" ? "delivered" : shipping.outbound.status;
            label = "Ontvangst bevestigd door huurder";
            break;
          case "start_return":
            status = "return_started";
            if (r.delivery === "shipping") {
              shipping.inbound.provider = shipping.inbound.provider ?? "PostNL";
              shipping.inbound.trackingNumber =
                shipping.inbound.trackingNumber ?? `3SMOCK${Math.floor(Math.random() * 1e7)}`;
              shipping.inbound.status = "label_created";
            }
            label = "Retour gestart";
            break;
          case "confirm_return_dropoff":
            if (r.delivery === "shipping") {
              status = "shipped_to_owner";
              shipping.inbound.status = "in_transit";
              shipping.inbound.lastEvent = "Pakket afgegeven";
              shipping.inbound.lastEventAt = nowIso();
              label = "Retourpakket afgegeven";
            } else {
              status = "returned_to_owner";
              inspectionDeadline = inspectionDeadlineFrom();
              label = "Jurk teruggebracht";
            }
            break;
          case "confirm_return_received":
            status = "inspection_period";
            shipping.inbound.status =
              r.delivery === "shipping" ? "delivered" : shipping.inbound.status;
            inspectionDeadline = inspectionDeadlineFrom();
            label = "Retour ontvangen door verhuurder";
            break;
          case "complete_inspection":
            status = "completed";
            payment.depositStatus = "release_pending";
            payment.payoutStatus = "eligible";
            reviewAllowed = true;
            inspectionDeadline = null;
            label = "Huur afgerond — borg wordt teruggestort";
            break;
        }

        return {
          ...r,
          status,
          payment,
          shipping,
          inspectionDeadline,
          reviewAllowed,
          audit: [
            ...r.audit,
            audit(
              rentalId,
              role,
              role === "owner" ? r.ownerId : r.renterId,
              action,
              label,
              { status },
            ),
          ],
        };
      });
    },
    [updateRental],
  );

  const reportProblem = useCallback<RentalStoreValue["reportProblem"]>(
    ({ rentalId, role, reason, description, requestedAmount, images }) => {
      const claimId = makeId("cl");
      const highRisk = reason === "not_returned" || reason === "package_lost";
      updateRental(rentalId, (r) => {
        const evidence: RentalEvidence[] = images.map((image) => ({
          id: makeId("ev"),
          rentalId,
          uploadedBy: role === "owner" ? r.ownerId : r.renterId,
          uploadedByRole: role,
          evidenceType: "photo",
          image,
          caption: "Bewijs bij melding",
          stage: "claim_evidence",
          createdAt: nowIso(),
        }));
        return {
          ...r,
          status: "claim_open",
          claimId,
          payment: {
            ...r.payment,
            depositStatus: "claim_hold",
            payoutStatus: "on_hold",
          },
          evidence: [...r.evidence, ...evidence],
          reviewAllowed: false,
          audit: [
            ...r.audit,
            audit(rentalId, role, role === "owner" ? r.ownerId : r.renterId, "problem_reported", "Probleem gemeld", {
              reason,
            }),
            audit(rentalId, "system", "system", "claim_opened", "Melding in behandeling genomen", {
              claimId,
            }),
            audit(rentalId, "system", "system", "deposit_status_changed", "Borg tijdelijk vastgehouden"),
            audit(rentalId, "system", "system", "payout_status_changed", "Uitbetaling gepauzeerd"),
          ],
        };
      });

      setClaims((prev) => {
        const claim: Claim = {
          id: claimId,
          rentalId,
          reportedBy: CURRENT_USER_ID,
          reportedByRole: role,
          reason,
          description,
          requestedAmount,
          status: "awaiting_other_party",
          priority: highRisk ? "high" : "normal",
          evidenceIds: [],
          responses: [],
          adminNotes: [],
          decision: null,
          createdAt: nowIso(),
          updatedAt: nowIso(),
        };
        const next = [claim, ...prev];
        try {
          localStorage.setItem(CLAIMS_KEY, JSON.stringify(next));
        } catch {
          /* ignore */
        }
        return next;
      });
      return claimId;
    },
    [updateRental],
  );

  const updateClaim = useCallback(
    (id: string, fn: (c: Claim) => Claim) => {
      setClaims((prev) => {
        const next = prev.map((c) => (c.id === id ? { ...fn(c), updatedAt: nowIso() } : c));
        try {
          localStorage.setItem(CLAIMS_KEY, JSON.stringify(next));
        } catch {
          /* ignore */
        }
        return next;
      });
    },
    [],
  );

  const respondToClaim = useCallback<RentalStoreValue["respondToClaim"]>(
    (claimId, role, agrees, text) => {
      updateClaim(claimId, (c) => ({
        ...c,
        status: agrees ? "under_review" : "evidence_collection",
        responses: [...c.responses, { by: CURRENT_USER_ID, role, agrees, text, at: nowIso() }],
      }));
      const claim = claims.find((c) => c.id === claimId);
      if (claim) {
        updateRental(claim.rentalId, (r) => ({
          ...r,
          audit: [
            ...r.audit,
            audit(r.id, role, CURRENT_USER_ID, "claim_response", agrees ? "Reactie: akkoord" : "Reactie: niet akkoord"),
          ],
        }));
      }
    },
    [claims, updateClaim, updateRental],
  );

  const setClaimStatus = useCallback<RentalStoreValue["setClaimStatus"]>(
    (claimId, status) => updateClaim(claimId, (c) => ({ ...c, status })),
    [updateClaim],
  );

  const addAdminNote = useCallback<RentalStoreValue["addAdminNote"]>(
    (claimId, note) =>
      updateClaim(claimId, (c) => ({ ...c, adminNotes: [...c.adminNotes, `${nowIso()} — ${note}`] })),
    [updateClaim],
  );

  const resolveClaim = useCallback<RentalStoreValue["resolveClaim"]>(
    (claimId, decision) => {
      const claim = claims.find((c) => c.id === claimId);
      const status: ClaimStatus =
        decision.type === "escalate"
          ? "under_review"
          : decision.type === "no_compensation" || decision.type === "deposit_returned"
            ? "resolved_renter"
            : decision.type === "deposit_withheld" || decision.type === "compensation_from_deposit"
              ? "resolved_owner"
              : "resolved_split";

      updateClaim(claimId, (c) => ({
        ...c,
        status,
        decision: {
          type: decision.type,
          amount: decision.amount,
          note: decision.note,
          decidedAt: nowIso(),
          decidedBy: "admin",
        },
      }));

      if (!claim || decision.type === "escalate") return;

      updateRental(claim.rentalId, (r) => {
        const amount = decision.amount ?? 0;
        const depositStatus =
          decision.type === "deposit_withheld" || amount >= r.payment.depositAmount
            ? "fully_claimed"
            : amount > 0
              ? "partially_claimed"
              : "release_pending";
        return {
          ...r,
          status: "claim_resolved",
          reviewAllowed: true,
          payment: {
            ...r.payment,
            depositStatus,
            depositClaimedAmount: amount,
            payoutStatus: "eligible",
          },
          audit: [
            ...r.audit,
            audit(r.id, "admin", "admin", "admin_decision", "Besluit Borro vastgelegd", {
              decision: decision.type,
              amount,
            }),
            audit(r.id, "system", "system", "deposit_status_changed", "Borgstatus bijgewerkt", {
              depositStatus,
            }),
            audit(r.id, "system", "system", "payout_status_changed", "Uitbetaling vrijgegeven"),
          ],
        };
      });
    },
    [claims, updateClaim, updateRental],
  );

  const resetDemo = useCallback(() => {
    persistRentals(seedRentals());
    persistClaims(seedClaims());
  }, [persistRentals, persistClaims]);

  const value = useMemo<RentalStoreValue>(
    () => ({
      rentals,
      claims,
      hydrated,
      getRental: (id) => rentals.find((r) => r.id === id),
      getClaim: (id) => (id ? claims.find((c) => c.id === id) : undefined),
      getClaimForRental: (rentalId) => claims.find((c) => c.rentalId === rentalId),
      roleFor: (rental) => (rental.ownerId === CURRENT_USER_ID ? "owner" : "renter"),
      addEvidence,
      advance,
      reportProblem,
      respondToClaim,
      setClaimStatus,
      addAdminNote,
      resolveClaim,
      resetDemo,
    }),
    [
      rentals,
      claims,
      hydrated,
      addEvidence,
      advance,
      reportProblem,
      respondToClaim,
      setClaimStatus,
      addAdminNote,
      resolveClaim,
      resetDemo,
    ],
  );

  return <RentalContext.Provider value={value}>{children}</RentalContext.Provider>;
}

export function useRentals() {
  const ctx = useContext(RentalContext);
  if (!ctx) throw new Error("useRentals moet binnen RentalProvider gebruikt worden");
  return ctx;
}

/** Simpele demo-toegang tot het Claim Center (later: rol uit user_roles + RLS). */
export function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    setIsAdmin(localStorage.getItem(ADMIN_KEY) === "true");
  }, []);
  return {
    isAdmin,
    enableAdmin: () => {
      localStorage.setItem(ADMIN_KEY, "true");
      setIsAdmin(true);
    },
  };
}
