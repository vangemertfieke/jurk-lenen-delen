import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/dressloop/primitives";
import { RentalListItem } from "@/components/dressloop/RentalListItem";
import { CURRENT_USER_ID, useRentals } from "@/lib/rental/store";
import type { RentalFlowStatus } from "@/lib/rental/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/account/huuritems")({
  component: Huuritems,
});

const groups: { key: string; label: string; statuses: RentalFlowStatus[] | null }[] = [
  { key: "alle", label: "Alles", statuses: null },
  {
    key: "aankomend",
    label: "Aankomend",
    statuses: ["pending_payment", "paid", "confirmed", "preparing", "ready_for_pickup", "shipped_to_renter"],
  },
  { key: "actief", label: "Actief", statuses: ["received_by_renter", "rental_active"] },
  {
    key: "retour",
    label: "Retourneren",
    statuses: ["return_due", "return_overdue", "return_started", "shipped_to_owner", "returned_to_owner", "inspection_period"],
  },
  { key: "afgerond", label: "Afgerond", statuses: ["completed", "payout_pending", "paid_out", "claim_resolved"] },
  { key: "problemen", label: "Meldingen", statuses: ["problem_reported", "claim_open"] },
  { key: "geannuleerd", label: "Geannuleerd", statuses: ["cancelled"] },
];

function Huuritems() {
  const [tab, setTab] = useState("alle");
  const { rentals } = useRentals();
  const mine = rentals.filter((r) => r.renterId === CURRENT_USER_ID);
  const group = groups.find((g) => g.key === tab);
  const list = group?.statuses ? mine.filter((r) => group.statuses!.includes(r.status)) : mine;

  return (
    <div className="space-y-10">
      <header>
        <h1 className="display text-3xl sm:text-4xl">Mijn huuritems</h1>
        <p className="mt-3 text-muted-foreground">
          De jurken die je huurt van anderen — met status, overdracht, retour en borg.
        </p>
      </header>

      <div className="-mx-1 flex gap-1 overflow-x-auto border-b border-border pb-px">
        {groups.map((t) => (
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

      {list.length === 0 ? (
        <EmptyState
          title="Nog geen huuritems in deze status"
          description="Zodra je een jurk boekt, volg je hier de hele huur van boeking tot retour."
          action={
            <Button asChild>
              <Link to="/jurken">Bekijk jurken</Link>
            </Button>
          }
        />
      ) : (
        <ul className="space-y-8">
          {list.map((r) => (
            <RentalListItem key={r.id} rental={r} role="renter" />
          ))}
        </ul>
      )}
    </div>
  );
}
