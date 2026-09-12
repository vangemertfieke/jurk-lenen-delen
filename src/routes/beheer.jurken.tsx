import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { AdminTabs } from "@/components/dressloop/AdminTabs";
import { EmptyState, StatusBadge } from "@/components/dressloop/primitives";
import { formatEuro } from "@/lib/config";
import { useIsTeamAdmin } from "@/lib/admin";
import {
  setListingVisibility,
  useListingStates,
  visibilityOf,
} from "@/lib/listing-state";
import { promotionOf, setPromotion, usePromotions } from "@/lib/promotions";
import { getDresses, getProfile } from "@/lib/mock-data";

export const Route = createFileRoute("/beheer/jurken")({
  head: () => ({
    meta: [
      { title: "Jurkenbeheer — Borro beheer" },
      { name: "description", content: "Intern overzicht van alle jurken op Borro." },
      { property: "og:title", content: "Jurkenbeheer — Borro beheer" },
      { property: "og:description", content: "Intern overzicht van alle jurken op Borro." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Jurkenbeheer,
});

function Jurkenbeheer() {
  const { isAdmin, hydrated } = useIsTeamAdmin();
  const states = useListingStates();
  const promos = usePromotions();
  const [query, setQuery] = useState("");

  const dresses = useMemo(() => {
    const q = query.trim().toLowerCase();
    return getDresses().filter((d) =>
      q ? `${d.brand} ${d.title} ${d.city} ${d.area}`.toLowerCase().includes(q) : true,
    );
  }, [query]);

  if (!hydrated) return null;

  if (!isAdmin) {
    return (
      <div className="container-page py-24">
        <p className="eyebrow">Intern</p>
        <h1 className="display mt-4 text-3xl">Jurkenbeheer</h1>
        <p className="mt-4 max-w-md text-sm text-muted-foreground">
          Deze omgeving is alleen voor Senne en Fieke. Log in met een Borro-beheeraccount om verder
          te gaan.
        </p>
        <Button className="mt-8" asChild>
          <Link to="/inloggen">Inloggen als beheer</Link>
        </Button>
      </div>
    );
  }

  const removed = dresses.filter((d) => visibilityOf(states, d.id) === "verwijderd").length;
  const boosted = dresses.filter((d) => {
    const p = promotionOf(promos, d.id);
    return p.uitgelicht || p.topZoekresultaat;
  }).length;

  return (
    <div className="container-page py-10 lg:py-16">
      <p className="eyebrow">Intern</p>
      <h1 className="display mt-4 text-3xl sm:text-4xl">Jurkenbeheer</h1>
      <AdminTabs />
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Overzicht van alle jurken op Borro. Je kunt een jurk pauzeren of uit het aanbod halen en
        per jurk promoot-opties instellen.
      </p>
      <p className="mt-3 max-w-2xl text-xs text-muted-foreground">
        Privacy: hier zie je alleen jurkgegevens en de voornaam van de verhuurder — geen adressen,
        e-mailadressen of betaalgegevens. Elke actie is zichtbaar voor het hele team.
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <StatusBadge>{dresses.length} jurken</StatusBadge>
        <StatusBadge tone="brand">{boosted} gepromoot</StatusBadge>
        <StatusBadge tone="warning">{removed} verwijderd</StatusBadge>
        <Button variant="quiet" size="sm" asChild>
          <Link to="/beheer/claims">Naar Claim Center</Link>
        </Button>
      </div>

      <div className="mt-6 max-w-md">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Zoek op merk, titel, stad of buurt"
          aria-label="Zoeken in jurken"
          className="h-11"
        />
      </div>

      {dresses.length === 0 ? (
        <div className="mt-12">
          <EmptyState title="Geen jurken gevonden" description="Pas je zoekopdracht aan." />
        </div>
      ) : (
        <ul className="mt-10 space-y-6">
          {dresses.map((d) => {
            const state = visibilityOf(states, d.id);
            const promo = promotionOf(promos, d.id);
            const owner = getProfile(d.ownerId);
            return (
              <li
                key={d.id}
                className="grid gap-5 rounded-2xl border border-border bg-card p-5 sm:grid-cols-[6rem_minmax(0,1fr)]"
              >
                <Link to="/jurken/$id" params={{ id: d.id }} className="block">
                  <img
                    src={d.images[0]}
                    alt={d.title}
                    loading="lazy"
                    className="aspect-[3/4] w-24 rounded-2xl object-cover"
                  />
                </Link>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge
                      tone={state === "verwijderd" ? "warning" : state === "gepauzeerd" ? "brand" : "neutral"}
                    >
                      {state === "verwijderd"
                        ? "Verwijderd"
                        : state === "gepauzeerd"
                          ? "Op pauze"
                          : "Zichtbaar"}
                    </StatusBadge>
                    {promo.uitgelicht ? <StatusBadge tone="brand">Uitgelicht</StatusBadge> : null}
                    {promo.topZoekresultaat ? (
                      <StatusBadge tone="brand">Top in zoeken</StatusBadge>
                    ) : null}
                  </div>
                  <p className="mt-2 font-medium">
                    {d.brand} — {d.title}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Maat {d.size} · {formatEuro(d.basePrice)} · {d.area} · verhuurder{" "}
                    {owner.firstName}
                  </p>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2 sm:max-w-lg">
                    <label className="flex items-center justify-between gap-3 rounded-2xl border border-border px-4 py-2 text-sm">
                      Uitgelicht op homepage
                      <Switch
                        checked={Boolean(promo.uitgelicht)}
                        onCheckedChange={(v) => {
                          setPromotion(d.id, { uitgelicht: v });
                          toast.success(v ? "Jurk uitgelicht." : "Uitlichting gestopt.");
                        }}
                        aria-label={`Uitlichten: ${d.title}`}
                      />
                    </label>
                    <label className="flex items-center justify-between gap-3 rounded-2xl border border-border px-4 py-2 text-sm">
                      Bovenaan in zoeken
                      <Switch
                        checked={Boolean(promo.topZoekresultaat)}
                        onCheckedChange={(v) => {
                          setPromotion(d.id, { topZoekresultaat: v });
                          toast.success(v ? "Jurk staat bovenaan in zoeken." : "Boost gestopt.");
                        }}
                        aria-label={`Boost in zoekresultaten: ${d.title}`}
                      />
                    </label>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const next = state === "gepauzeerd" ? "actief" : "gepauzeerd";
                        setListingVisibility(d.id, next);
                        toast.success(
                          next === "actief" ? "Jurk is weer zichtbaar." : "Jurk staat op pauze.",
                        );
                      }}
                    >
                      {state === "gepauzeerd" ? "Weer zichtbaar maken" : "Tijdelijk pauzeren"}
                    </Button>
                    {state === "verwijderd" ? (
                      <Button
                        variant="quiet"
                        size="sm"
                        onClick={() => {
                          setListingVisibility(d.id, "actief");
                          toast.success("Jurk teruggezet in het aanbod.");
                        }}
                      >
                        Terugzetten
                      </Button>
                    ) : (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="quiet" size="sm">
                            Verwijderen uit aanbod
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Jurk uit het aanbod halen?</AlertDialogTitle>
                            <AlertDialogDescription>
                              {d.title} is daarna niet meer zichtbaar voor huurders. Je kunt de
                              jurk later terugzetten. Laat de verhuurder weten waarom.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuleren</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => {
                                setListingVisibility(d.id, "verwijderd");
                                toast.success("Jurk verwijderd uit het aanbod.");
                              }}
                            >
                              Verwijderen
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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
