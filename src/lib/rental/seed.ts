import { calculateDeposit, calculateOwnerEarnings, PROTECTION_CONFIG, round2 } from "./config";
import { inspectionDeadlineFrom } from "./engine";
import type { Claim, ProtectedRental, RentalEvidence, RentalFlowStatus } from "./types";
import dress1 from "@/assets/dress-1.jpg";
import dress2 from "@/assets/dress-2.jpg";
import dress3 from "@/assets/dress-3.jpg";
import dress4 from "@/assets/dress-4.jpg";
import dress5 from "@/assets/dress-5.jpg";
import { FEES } from "@/lib/config";

const evidenceImages = [dress1, dress2, dress3, dress4, dress5];

function iso(daysFromNow: number, hour = 12) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

interface SeedInput {
  id: string;
  dressId: string;
  renterId: string;
  ownerId: string;
  status: RentalFlowStatus;
  delivery: "pickup" | "shipping";
  rentalAmount: number;
  originalPrice: number;
  estimatedValue: number;
  startOffset: number;
  endOffset: number;
  city: string;
  area: string;
  address: string;
}

function makeRental(input: SeedInput): ProtectedRental {
  const deposit = calculateDeposit(input.estimatedValue);
  const shippingFee = input.delivery === "shipping" ? FEES.shippingFee : 0;
  const earnings = calculateOwnerEarnings(input.rentalAmount);
  const done = ["completed", "payout_pending", "paid_out", "claim_resolved"].includes(input.status);
  const claimish = ["problem_reported", "claim_open"].includes(input.status);

  const evidence: RentalEvidence[] = [];
  const pushEvidence = (
    stage: RentalEvidence["stage"],
    role: RentalEvidence["uploadedByRole"],
    caption: string,
    offset: number,
    imgIndex: number,
  ) => {
    evidence.push({
      id: `${input.id}_ev${evidence.length + 1}`,
      rentalId: input.id,
      uploadedBy: role === "owner" ? input.ownerId : input.renterId,
      uploadedByRole: role,
      evidenceType: "photo",
      image: evidenceImages[imgIndex % evidenceImages.length]!,
      caption,
      stage,
      createdAt: iso(offset, 10),
    });
  };

  const afterHandover = [
    "received_by_renter",
    "rental_active",
    "return_due",
    "return_overdue",
    "return_started",
    "shipped_to_owner",
    "returned_to_owner",
    "inspection_period",
    "completed",
    "problem_reported",
    "claim_open",
    "claim_resolved",
    "payout_pending",
    "paid_out",
  ];
  if (afterHandover.includes(input.status) || input.status === "ready_for_pickup" || input.status === "shipped_to_renter") {
    pushEvidence("before_handover", "owner", "Voorkant voor overdracht", input.startOffset - 1, 0);
    pushEvidence("before_handover", "owner", "Achterkant voor overdracht", input.startOffset - 1, 1);
  }
  if (afterHandover.includes(input.status)) {
    pushEvidence("received_by_renter", "renter", "Bij ontvangst", input.startOffset, 2);
  }
  if (["returned_to_owner", "inspection_period", "completed", "problem_reported", "claim_open", "claim_resolved", "shipped_to_owner", "payout_pending", "paid_out"].includes(input.status)) {
    pushEvidence("before_return", "renter", "Voor de retour", input.endOffset, 3);
  }
  if (["completed", "problem_reported", "claim_open", "claim_resolved", "payout_pending", "paid_out", "inspection_period"].includes(input.status)) {
    pushEvidence("received_by_owner", "owner", "Na de retour", input.endOffset + 1, 4);
  }

  return {
    id: input.id,
    dressId: input.dressId,
    renterId: input.renterId,
    ownerId: input.ownerId,
    startDate: iso(input.startOffset),
    endDate: iso(input.endOffset),
    returnDueDate: iso(input.endOffset, 18),
    delivery: input.delivery,
    status: input.status,
    dressValue: {
      originalPrice: input.originalPrice,
      estimatedValue: input.estimatedValue,
      flaggedForReview: input.estimatedValue > PROTECTION_CONFIG.dressValue.reviewThreshold,
    },
    pickup:
      input.delivery === "pickup"
        ? {
            approximateLocation: `${input.city} ${input.area}`,
            exactAddress: input.address,
            addressReleased: true,
          }
        : {
            approximateLocation: `${input.city} ${input.area}`,
            exactAddress: input.address,
            addressReleased: false,
          },
    payment: {
      status: input.status === "pending_payment" ? "payment_pending" : "payment_succeeded",
      rentalAmount: round2(input.rentalAmount),
      serviceFee: PROTECTION_CONFIG.renterServiceFee,
      shippingFee,
      depositAmount: deposit,
      totalCharged: round2(
        input.rentalAmount + PROTECTION_CONFIG.renterServiceFee + shippingFee + deposit,
      ),
      commissionRate: earnings.commissionRate,
      commissionAmount: earnings.commissionAmount,
      ownerPayoutAmount: earnings.payout,
      depositStatus: claimish ? "claim_hold" : done ? "released" : "secured",
      depositClaimedAmount: 0,
      payoutStatus: claimish ? "on_hold" : input.status === "paid_out" ? "paid" : done ? "eligible" : "not_eligible",
      stripePaymentIntentId: null,
      stripeTransferId: null,
      stripeAccountId: null,
      paidAt: iso(input.startOffset - 5, 9),
      payoutAt: null,
    },
    shipping: {
      outbound: {
        provider: input.delivery === "shipping" ? "PostNL" : null,
        trackingNumber: input.delivery === "shipping" ? "3STEST1234567" : null,
        labelUrl: null,
        status:
          input.delivery !== "shipping"
            ? "not_created"
            : afterHandover.includes(input.status)
              ? "delivered"
              : input.status === "shipped_to_renter"
                ? "in_transit"
                : "not_created",
        lastEvent: input.delivery === "shipping" ? "Zending gescand in sorteercentrum" : null,
        lastEventAt: input.delivery === "shipping" ? iso(input.startOffset - 1, 8) : null,
      },
      inbound: {
        provider: input.delivery === "shipping" ? "PostNL" : null,
        trackingNumber:
          input.delivery === "shipping" && ["shipped_to_owner", "returned_to_owner", "inspection_period", "completed", "claim_open", "problem_reported"].includes(input.status)
            ? "3STEST7654321"
            : null,
        labelUrl: null,
        status:
          input.delivery !== "shipping"
            ? "not_created"
            : ["returned_to_owner", "inspection_period", "completed", "claim_open", "problem_reported", "paid_out", "payout_pending"].includes(input.status)
              ? "delivered"
              : input.status === "shipped_to_owner"
                ? "in_transit"
                : "not_created",
        lastEvent: null,
        lastEventAt: null,
      },
    },
    evidence,
    audit: [
      {
        id: `${input.id}_a1`,
        rentalId: input.id,
        actor: "system",
        actorId: "system",
        action: "booking_created",
        label: "Boeking aangemaakt",
        at: iso(input.startOffset - 5, 9),
      },
      {
        id: `${input.id}_a2`,
        rentalId: input.id,
        actor: "system",
        actorId: "system",
        action: "payment_status_changed",
        label: "Betaling gelukt",
        at: iso(input.startOffset - 5, 9),
      },
    ],
    claimId: claimish ? `cl_${input.id}` : null,
    inspectionDeadline: ["returned_to_owner", "inspection_period"].includes(input.status)
      ? inspectionDeadlineFrom()
      : null,
    reviewAllowed: done,
    createdAt: iso(input.startOffset - 5, 9),
    updatedAt: iso(0, 9),
  };
}

export function seedRentals(): ProtectedRental[] {
  return [
    makeRental({
      id: "r1",
      dressId: "d1",
      renterId: "me",
      ownerId: "u1",
      status: "ready_for_pickup",
      delivery: "pickup",
      rentalAmount: 55,
      originalPrice: 320,
      estimatedValue: 190,
      startOffset: 1,
      endOffset: 5,
      city: "Amsterdam",
      area: "Zuid",
      address: "Cornelis Schuytstraat 24, 1071 JG Amsterdam",
    }),
    makeRental({
      id: "r2",
      dressId: "d4",
      renterId: "me",
      ownerId: "u4",
      status: "rental_active",
      delivery: "shipping",
      rentalAmount: 60,
      originalPrice: 450,
      estimatedValue: 300,
      startOffset: -2,
      endOffset: 2,
      city: "Den Haag",
      area: "Statenkwartier",
      address: "Frederik Hendriklaan 12, 2582 BH Den Haag",
    }),
    makeRental({
      id: "r3",
      dressId: "d3",
      renterId: "me",
      ownerId: "u3",
      status: "completed",
      delivery: "pickup",
      rentalAmount: 35,
      originalPrice: 120,
      estimatedValue: 80,
      startOffset: -20,
      endOffset: -16,
      city: "Rotterdam",
      area: "Kralingen",
      address: "Oudedijk 88, 3062 AB Rotterdam",
    }),
    makeRental({
      id: "o1",
      dressId: "d5",
      renterId: "u2",
      ownerId: "me",
      status: "inspection_period",
      delivery: "shipping",
      rentalAmount: 48,
      originalPrice: 260,
      estimatedValue: 200,
      startOffset: -6,
      endOffset: -1,
      city: "Amsterdam",
      area: "Oost",
      address: "Javastraat 4, 1094 HA Amsterdam",
    }),
    makeRental({
      id: "o2",
      dressId: "d2",
      renterId: "u3",
      ownerId: "me",
      status: "claim_open",
      delivery: "shipping",
      rentalAmount: 45,
      originalPrice: 380,
      estimatedValue: 250,
      startOffset: -14,
      endOffset: -9,
      city: "Amsterdam",
      area: "West",
      address: "Bosboom Toussaintstraat 9, 1054 AN Amsterdam",
    }),
  ];
}

export function seedClaims(): Claim[] {
  return [
    {
      id: "cl_o2",
      rentalId: "o2",
      reportedBy: "me",
      reportedByRole: "owner",
      reason: "damage",
      description:
        "Bij de retour zit er een scheurtje van ongeveer 3 cm in de zoom aan de linkerkant. Op de foto's van voor de verhuur is dit niet zichtbaar.",
      requestedAmount: 45,
      status: "awaiting_other_party",
      priority: "normal",
      evidenceIds: [],
      responses: [],
      adminNotes: [],
      decision: null,
      createdAt: iso(-8, 11),
      updatedAt: iso(-8, 11),
    },
  ];
}
