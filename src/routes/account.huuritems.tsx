import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState, StatusBadge } from "@/components/dressloop/primitives";
import { formatDateNL, formatEuro } from "@/lib/config";
import { getDress, getProfile, rentals } from "@/lib/mock-data";
import type { RentalStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/account/huuritems")({
  component: Huuritems,
});

const tabs: { key: RentalStatus | "alle"; label: string }[] = [
  { key: "alle", label: "Alles" },
  { key: "aanvraag", label: "Aanvragen" },
  { key: "aankomend", label: "Aankomend" },
  { key: "actief", label: "Actief" },
  { key: "retourneren", label: "Retourneren" },
  { key: "afgerond", label: "Afgerond" },
  { key: "geannuleerd", label: "Geannuleerd" },
];

function Huuritems() {
  const [tab, setTab] = useState<RentalStatus | "alle">("alle");
  const list = rentals.filter((r) => tab === "alle" || r.status === tab);

  return (
    <div className="space-y-10">
      <header>
        <h1 className="display text-3xl sm:text-4xl">Mijn huuritems</h1>
        <p className="mt-3 text-muted-foreground">De jurken die je huurt van anderen.</p>
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

      {list.length === 0 ? (
        <EmptyState
          title="Nog geen huuritems in deze status"
          description="Zodra je een jurk boekt verschijnt die hier, met de datums en de volgende stap."
          action={
            <Button asChild>
              <Link to="/jurken">Ontdek jurken</Link>
            </Button>
          }
        />
      ) : (
        <ul className="space-y-8">
          {list.map((r) => {
            const dress = getDress(r.dressId);
            const owner = getProfile(r.ownerId);
            if (!dress) return null;
            return (
              <li key={r.id} className="grid gap-5 border-t border-border pt-6 sm:grid-cols-[6rem_minmax(0,1fr)]">
                <Link to="/jurken/$id" params={{ id: dress.id }} className="block w-24">
                  <img
                    src={dress.images[0]}
                    alt={dress.title}
                    loading="lazy"
                    className="aspect-[3/4] w-full object-cover"
                  />
                </Link>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="font-medium">{dress.title}</p>
                    <StatusBadge
                      tone={
                        r.status === "actief"
                          ? "success"
                          : r.status === "geannuleerd"
                            ? "neutral"
                            : "brand"
                      }
                    >
                      {r.status}
                    </StatusBadge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Van {owner.firstName} · {formatDateNL(new Date(r.from))} —{" "}
                    {formatDateNL(new Date(r.to))}
                  </p>
                  <p className="price mt-2 text-sm">{formatEuro(r.price)}</p>
                  <p className="mt-3 text-sm">
                    <span className="text-muted-foreground">Volgende stap: </span>
                    {r.nextAction}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">Borg {r.depositStatus}</p>
                  <div className="mt-4 flex flex-wrap gap-6">
                    <Button variant="quiet" size="sm" asChild>
                      <Link to="/account/berichten">Stuur een bericht</Link>
                    </Button>
                    <Button variant="quiet" size="sm" asChild>
                      <Link to="/jurken/$id" params={{ id: dress.id }}>
                        Bekijk jurk
                      </Link>
                    </Button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
