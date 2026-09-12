import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AdminTabs } from "@/components/dressloop/AdminTabs";
import { EmptyState, StatusBadge } from "@/components/dressloop/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatEuro } from "@/lib/config";
import { useIsTeamAdmin } from "@/lib/admin";
import { getDress, getProfile } from "@/lib/mock-data";
import { rentalStatusLabel, rentalStatusTone } from "@/lib/rental/labels";
import { useRentals } from "@/lib/rental/store";
import { reservationLabels, useReservations } from "@/lib/reservations";

export const Route = createFileRoute("/beheer/boekingen")({
  head: () => ({
    meta: [
      { title: "Boekingen — Borro beheer" },
      { name: "description", content: "Intern overzicht van alle boekingen en reserveringen." },
      { property: "og:title", content: "Boekingen — Borro beheer" },
      { property: "og:description", content: "Intern overzicht van alle boekingen en reserveringen." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Boekingenbeheer,
});

type Row = {
  key: string;
  kind: "boeking" | "reservering";
  dressId: string;
  title: string;
  ownerName: string;
  delivery: "pickup" | "shipping";
  from: string;
  to: string;
  statusLabel: string;
  tone: "neutral" | "brand" | "success" | "warning";
  amount: number | null;
  createdAt: string;
  claimId?: string | null;
};

function dateNL(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" });
}

function Boekingenbeheer() {
  const { isAdmin, hydrated } = useIsTeamAdmin();
  const { rentals } = useRentals();
  const reservations = useReservations();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"alles" | "boeking" | "reservering">("alles");

  const rows = useMemo<Row[]>(() => {
    const fromRentals: Row[] = rentals.map((r) => {
      const dress = getDress(r.dressId);
      return {
        key: r.id,
        kind: "boeking",
        dressId: r.dressId,
        title: dress ? `${dress.brand} — ${dress.title}` : r.dressId,
        ownerName: getProfile(r.ownerId)?.firstName ?? "—",
        delivery: r.delivery,
        from: r.startDate,
        to: r.endDate,
        statusLabel: rentalStatusLabel[r.status],
        tone: rentalStatusTone[r.status],
        amount: r.payment.totalCharged,
        createdAt: r.createdAt,
        claimId: r.claimId,
      };
    });

    const fromReservations: Row[] = reservations.map((res) => {
      const dress = getDress(res.dressId);
      return {
        key: res.id,
        kind: "reservering",
        dressId: res.dressId,
        title: dress ? `${dress.brand} — ${dress.title}` : res.dressId,
        ownerName: dress ? (getProfile(dress.ownerId)?.firstName ?? "—") : "—",
        delivery: res.delivery,
        from: res.from,
        to: res.to,
        statusLabel: reservationLabels[res.status],
        tone:
          res.status === "bevestigd"
            ? "success"
            : res.status === "wacht_op_verhuurder"
              ? "warning"
              : "neutral",
        amount: dress?.basePrice ?? null,
        createdAt: res.createdAt,
      };
    });

    const q = query.trim().toLowerCase();
    return [...fromRentals, ...fromReservations]
      .filter((row) => (filter === "alles" ? true : row.kind === filter))
      .filter((row) =>
        q ? `${row.title} ${row.ownerName} ${row.statusLabel}`.toLowerCase().includes(q) : true,
      )
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }, [rentals, reservations, query, filter]);

  if (!hydrated) return null;

  if (!isAdmin) {
    return (
      <div className="container-page py-24">
        <p className="eyebrow">Intern</p>
        <h1 className="display mt-4 text-3xl">Boekingen</h1>
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

  const openRequests = rows.filter(
    (r) => r.kind === "reservering" && r.statusLabel === reservationLabels.wacht_op_verhuurder,
  ).length;

  const chip = (value: typeof filter, label: string) => (
    <button
      key={value}
      type="button"
      onClick={() => setFilter(value)}
      className={`rounded-full border px-4 py-2 text-sm transition-colors ${
        filter === value
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border hover:border-border-strong"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="container-page py-10 lg:py-16">
      <p className="eyebrow">Intern</p>
      <h1 className="display mt-4 text-3xl sm:text-4xl">Boekingen</h1>
      <AdminTabs />
      <p className="mt-6 max-w-2xl text-muted-foreground">
        Alle boekingen en reserveringsverzoeken met jurk, leveroptie, datums en status.
      </p>
      <p className="mt-3 max-w-2xl text-xs text-muted-foreground">
        Privacy: je ziet alleen jurk-, boekings- en voornaamgegevens — geen adressen of
        betaalgegevens.
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <StatusBadge>{rows.length} boekingen</StatusBadge>
        <StatusBadge tone="warning">{openRequests} wachten op verhuurder</StatusBadge>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {chip("alles", "Alles")}
        {chip("boeking", "Betaalde boekingen")}
        {chip("reservering", "Reserveringsverzoeken")}
        <div className="w-full max-w-xs">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Zoek op jurk, verhuurder of status"
            aria-label="Zoeken in boekingen"
            className="h-11"
          />
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="mt-12">
          <EmptyState
            title="Geen boekingen gevonden"
            description="Er zijn nog geen boekingen of reserveringen die hierbij passen."
          />
        </div>
      ) : (
        <ul className="mt-10 space-y-4">
          {rows.map((row) => (
            <li key={row.key} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge tone={row.kind === "boeking" ? "brand" : "neutral"}>
                  {row.kind === "boeking" ? "Boeking" : "Reserveringsverzoek"}
                </StatusBadge>
                <StatusBadge tone={row.tone}>{row.statusLabel}</StatusBadge>
                <StatusBadge>
                  {row.delivery === "pickup" ? "Ophalen" : "Verzenden"}
                </StatusBadge>
                {row.claimId ? <StatusBadge tone="warning">Claim loopt</StatusBadge> : null}
              </div>
              <p className="mt-3 font-medium">{row.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {dateNL(row.from)} t/m {dateNL(row.to)} · verhuurder {row.ownerName}
                {row.amount !== null ? ` · ${formatEuro(row.amount)}` : ""}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Aangemaakt op {dateNL(row.createdAt)}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to="/jurken/$id" params={{ id: row.dressId }}>
                    Bekijk jurk
                  </Link>
                </Button>
                {row.kind === "boeking" ? (
                  <Button variant="quiet" size="sm" asChild>
                    <Link to="/huur/$id" params={{ id: row.key }}>
                      Bekijk huurdossier
                    </Link>
                  </Button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
