import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { AdminTabs } from "@/components/dressloop/AdminTabs";
import { StatusBadge } from "@/components/dressloop/primitives";
import { Button } from "@/components/ui/button";
import { formatEuro } from "@/lib/config";
import { useIsTeamAdmin } from "@/lib/admin";
import { getDress, getDresses } from "@/lib/mock-data";
import { useListingStates, visibilityOf } from "@/lib/listing-state";
import { promotionOf, usePromotions } from "@/lib/promotions";
import { rentalStatusLabel } from "@/lib/rental/labels";
import { useRentals } from "@/lib/rental/store";
import { useReservations } from "@/lib/reservations";

export const Route = createFileRoute("/beheer/")({
  head: () => ({
    meta: [
      { title: "Beheeroverzicht — Borro" },
      { name: "description", content: "Intern dashboard met boekingen, jurken en promoties." },
      { property: "og:title", content: "Beheeroverzicht — Borro" },
      { property: "og:description", content: "Intern dashboard met boekingen, jurken en promoties." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Beheeroverzicht,
});

function dateNL(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("nl-NL", { day: "numeric", month: "short" });
}

function Beheeroverzicht() {
  const { isAdmin, hydrated } = useIsTeamAdmin();
  const { rentals, claims } = useRentals();
  const reservations = useReservations();
  const states = useListingStates();
  const promos = usePromotions();

  const stats = useMemo(() => {
    const dresses = getDresses();
    const zichtbaar = dresses.filter((d) => visibilityOf(states, d.id) === "actief").length;
    const gepromoot = dresses.filter((d) => {
      const p = promotionOf(promos, d.id);
      return p.uitgelicht || p.topZoekresultaat;
    }).length;
    const wachtend = reservations.filter((r) => r.status === "wacht_op_verhuurder").length;
    const lopend = rentals.filter(
      (r) => r.status !== "completed" && r.status !== "cancelled" && r.status !== "paid_out",
    ).length;
    const omzet = rentals.reduce((sum, r) => sum + r.payment.commissionAmount, 0);
    const openClaims = claims.filter((c) => !c.status.startsWith("resolved_") && c.status !== "closed").length;
    return {
      dressCount: dresses.length,
      zichtbaar,
      gepromoot,
      wachtend,
      lopend,
      omzet,
      openClaims,
      boekingen: rentals.length,
    };
  }, [rentals, claims, reservations, states, promos]);

  const recent = useMemo(() => {
    const items = [
      ...rentals.map((r) => ({
        key: r.id,
        when: r.createdAt,
        text: `Boeking · ${getDress(r.dressId)?.title ?? r.dressId} — ${rentalStatusLabel[r.status]}`,
      })),
      ...reservations.map((r) => ({
        key: r.id,
        when: r.createdAt,
        text: `Reservering · ${getDress(r.dressId)?.title ?? r.dressId} — ${r.status === "wacht_op_verhuurder" ? "wacht op verhuurder" : r.status}`,
      })),
    ];
    return items.sort((a, b) => (a.when < b.when ? 1 : -1)).slice(0, 6);
  }, [rentals, reservations]);

  if (!hydrated) return null;

  if (!isAdmin) {
    return (
      <div className="container-page py-24">
        <p className="eyebrow">Intern</p>
        <h1 className="display mt-4 text-3xl">Beheer</h1>
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

  const cards: { label: string; value: string; hint?: string }[] = [
    { label: "Boekingen totaal", value: String(stats.boekingen) },
    { label: "Lopende boekingen", value: String(stats.lopend) },
    { label: "Wacht op verhuurder", value: String(stats.wachtend), hint: "Reserveringsverzoeken" },
    { label: "Open meldingen", value: String(stats.openClaims) },
    { label: "Commissie", value: formatEuro(stats.omzet), hint: "Over alle boekingen" },
    {
      label: "Jurken zichtbaar",
      value: `${stats.zichtbaar} / ${stats.dressCount}`,
      hint: `${stats.gepromoot} gepromoot`,
    },
  ];

  return (
    <div className="container-page py-10 lg:py-16">
      <p className="eyebrow">Intern</p>
      <h1 className="display mt-4 text-3xl sm:text-4xl">Beheeroverzicht</h1>
      <AdminTabs />
      <p className="mt-6 max-w-2xl text-muted-foreground">
        Alles wat er op Borro gebeurt in één blik: boekingen, reserveringen, meldingen en de jurken
        die jullie uitlichten.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">{c.label}</p>
            <p className="display mt-2 text-3xl">{c.value}</p>
            {c.hint ? <p className="mt-1 text-xs text-muted-foreground">{c.hint}</p> : null}
          </div>
        ))}
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-lg font-medium">Laatste activiteit</h2>
          {recent.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">Nog geen boekingen of verzoeken.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {recent.map((item) => (
                <li key={item.key} className="text-sm">
                  <span className="text-muted-foreground">{dateNL(item.when)}</span> · {item.text}
                </li>
              ))}
            </ul>
          )}
          <Button variant="outline" size="sm" className="mt-6" asChild>
            <Link to="/beheer/boekingen">Alle boekingen bekijken</Link>
          </Button>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-lg font-medium">Snel regelen</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Jurken uitlichten, boosten in zoeken, pauzeren of verwijderen — en meldingen afhandelen.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button size="sm" asChild>
              <Link to="/beheer/jurken">Jurken &amp; promotie</Link>
            </Button>
            <Button variant="quiet" size="sm" asChild>
              <Link to="/beheer/claims">Claim Center</Link>
            </Button>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <StatusBadge tone="brand">{stats.gepromoot} gepromoot</StatusBadge>
            <StatusBadge tone="warning">{stats.openClaims} open meldingen</StatusBadge>
          </div>
        </div>
      </div>
    </div>
  );
}
