import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EmptyState, StatusBadge } from "@/components/dressloop/primitives";
import { calculateOwnerPayout, formatDateNL, formatEuro } from "@/lib/config";
import { getDress, getMyListings, getProfile, myDrafts, myRentalsOut } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/account/verhuur")({
  component: Verhuur,
});

const tabs = [
  { key: "aanvraag", label: "Nieuwe aanvragen" },
  { key: "aankomend", label: "Aankomend" },
  { key: "actief", label: "Actief" },
  { key: "retourneren", label: "Wachten op retour" },
  { key: "afgerond", label: "Afgerond" },
  { key: "jurken", label: "Mijn jurken" },
  { key: "concepten", label: "Concepten" },
] as const;

function Verhuur() {
  const [tab, setTab] = useState<(typeof tabs)[number]["key"]>("aanvraag");
  const listings = getMyListings();
  const bookings = myRentalsOut.filter((r) => r.status === tab);

  return (
    <div className="space-y-10">
      <header className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <div className="min-w-0">
          <h1 className="display text-3xl sm:text-4xl">Mijn verhuur</h1>
          <p className="mt-3 text-muted-foreground">De jurken die jij verhuurt aan anderen.</p>
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
          description="Nieuwe aanvragen en lopende verhuur verschijnen hier zodra iemand jouw jurk boekt."
          action={
            <Button asChild>
              <Link to="/verhuren">Plaats een jurk</Link>
            </Button>
          }
        />
      ) : (
        <ul className="space-y-8">
          {bookings.map((r) => {
            const dress = getDress(r.dressId);
            const renter = getProfile(r.renterId);
            const payout = calculateOwnerPayout(r.price);
            if (!dress) return null;
            return (
              <li key={r.id} className="grid gap-5 border-t border-border pt-6 sm:grid-cols-[6rem_minmax(0,1fr)]">
                <img
                  src={dress.images[0]}
                  alt={dress.title}
                  loading="lazy"
                  className="aspect-[3/4] w-24 object-cover"
                />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="font-medium">{dress.title}</p>
                    <StatusBadge tone={r.status === "aanvraag" ? "warning" : "brand"}>
                      {r.status}
                    </StatusBadge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Voor {renter.firstName} · {formatDateNL(new Date(r.from))} —{" "}
                    {formatDateNL(new Date(r.to))}
                  </p>
                  <p className="mt-2 text-sm">
                    <span className="price">{formatEuro(r.price)}</span>
                    <span className="text-muted-foreground">
                      {" "}
                      · jij ontvangt {formatEuro(payout.payout)}
                    </span>
                  </p>
                  <p className="mt-3 text-sm">
                    <span className="text-muted-foreground">Volgende stap: </span>
                    {r.nextAction}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-4">
                    {r.status === "aanvraag" ? (
                      <>
                        <Button size="sm" onClick={() => toast.success("Aanvraag geaccepteerd")}>
                          Accepteren
                        </Button>
                        <Button
                          variant="quiet"
                          size="sm"
                          onClick={() => toast("Aanvraag geweigerd")}
                        >
                          Weigeren
                        </Button>
                      </>
                    ) : (
                      <Button variant="quiet" size="sm" asChild>
                        <Link to="/account/berichten">Stuur een bericht</Link>
                      </Button>
                    )}
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
