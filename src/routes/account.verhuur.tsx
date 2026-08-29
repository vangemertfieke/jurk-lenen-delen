import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState, StatusBadge } from "@/components/dressloop/primitives";
import { RentalListItem } from "@/components/dressloop/RentalListItem";
import { calculateOwnerPayout, formatEuro } from "@/lib/config";
import { getMyListings, myDrafts } from "@/lib/mock-data";
import { CURRENT_USER_ID, useRentals } from "@/lib/rental/store";
import type { RentalFlowStatus } from "@/lib/rental/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/account/verhuur")({
  component: Verhuur,
});

const tabs: { key: string; label: string; statuses: RentalFlowStatus[] | null }[] = [
  {
    key: "actie",
    label: "Actie nodig",
    statuses: [
      "paid",
      "confirmed",
      "preparing",
      "shipped_to_owner",
      "returned_to_owner",
      "inspection_period",
      "return_overdue",
      "problem_reported",
      "claim_open",
    ],
  },
  {
    key: "lopend",
    label: "Lopend",
    statuses: [
      "ready_for_pickup",
      "shipped_to_renter",
      "received_by_renter",
      "rental_active",
      "return_due",
      "return_started",
    ],
  },
  {
    key: "afgerond",
    label: "Afgerond",
    statuses: ["completed", "claim_resolved", "payout_pending", "paid_out"],
  },
  { key: "alle", label: "Alle verhuur", statuses: null },
  { key: "jurken", label: "Mijn jurken", statuses: [] },
  { key: "concepten", label: "Concepten", statuses: [] },
];

function Verhuur() {
  const [tab, setTab] = useState("actie");
  const listings = getMyListings();
  const { rentals } = useRentals();
  const mine = rentals.filter((r) => r.ownerId === CURRENT_USER_ID);
  const active = tabs.find((t) => t.key === tab);
  const bookings =
    active?.statuses === null ? mine : mine.filter((r) => active?.statuses?.includes(r.status));

  return (
    <div className="space-y-10">
      <header className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <div className="min-w-0">
          <h1 className="display text-3xl sm:text-4xl">Mijn verhuur</h1>
          <p className="mt-3 text-muted-foreground">
            Volg elke verhuur van overdracht tot retour, controle en uitbetaling.
          </p>
        </div>
        <Button asChild className="justify-self-start">
          <Link to="/verhuren">Nieuwe jurk plaatsen</Link>
        </Button>
      </header>

      <div className="-mx-1 flex gap-1 overflow-x-auto border-b border-border pb-px">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              "shrink-0 whitespace-nowrap border-b-2 px-3 pb-3 text-sm transition-colors",
              tab === t.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "jurken" ? (
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-3">
          {listings.map((d) => (
            <article key={d.id}>
              <Link to="/jurken/$id" params={{ id: d.id }}>
                <img
                  src={d.images[0]}
                  alt={d.title}
                  loading="lazy"
                  className="aspect-[3/4] w-full object-cover"
                />
              </Link>
              <p className="mt-3 text-sm">{d.title}</p>
              <p className="price text-sm text-muted-foreground">{formatEuro(d.basePrice)}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Jij ontvangt {formatEuro(calculateOwnerPayout(d.basePrice).payout)}
              </p>
            </article>
          ))}
        </div>
      ) : tab === "concepten" ? (
        myDrafts.length === 0 ? (
          <EmptyState
            title="Geen concepten"
            description="Als je een plaatsing tussentijds bewaart, vind je die hier terug."
          />
        ) : (
          <ul className="space-y-6">
            {myDrafts.map((d) => (
              <li key={d.id} className="flex gap-5 border-t border-border pt-6">
                <img
                  src={d.images[0]}
                  alt={d.title}
                  loading="lazy"
                  className="aspect-[3/4] w-20 shrink-0 object-cover"
                />
                <div className="min-w-0">
                  <StatusBadge>Concept</StatusBadge>
                  <p className="mt-2 font-medium">{d.title}</p>
                  <Button variant="quiet" size="sm" asChild className="mt-2">
                    <Link to="/verhuren">Afmaken</Link>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )
      ) : bookings.length === 0 ? (
        <EmptyState
          title="Niets in deze status"
          description="Nieuwe boekingen en lopende verhuur verschijnen hier zodra iemand jouw jurk boekt."
          action={
            <Button asChild>
              <Link to="/verhuren">Plaats een jurk</Link>
            </Button>
          }
        />
      ) : (
        <ul className="space-y-8">
          {bookings.map((r) => (
            <RentalListItem key={r.id} rental={r} role="owner" />
          ))}
        </ul>
      )}
    </div>
  );
}
