import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PriceBreakdown } from "@/components/dressloop/PriceBreakdown";
import { StatusBadge } from "@/components/dressloop/primitives";
import {
  FEES,
  daysBetween,
  formatDateNL,
  formatEuro,
  type DeliveryMethod,
} from "@/lib/config";
import { getDress, getProfile } from "@/lib/mock-data";
import { createReservation } from "@/lib/reservations";

interface ReserveSearch {
  van?: string | undefined;
  tot?: string | undefined;
  levering?: DeliveryMethod | undefined;
}

export const Route = createFileRoute("/reserveren/$id")({
  validateSearch: (search: Record<string, unknown>): ReserveSearch => ({
    van: typeof search["van"] === "string" ? search["van"] : undefined,
    tot: typeof search["tot"] === "string" ? search["tot"] : undefined,
    levering: search["levering"] === "shipping" ? "shipping" : "pickup",
  }),
  loader: ({ params }) => {
    const dress = getDress(params.id);
    if (!dress) throw notFound();
    return { dress };
  },
  head: () => ({
    meta: [
      { title: "Reserveren — Borro" },
      {
        name: "description",
        content: "Stuur je reserveringsverzoek naar de verhuurder en wacht op bevestiging.",
      },
      { property: "og:title", content: "Reserveren — Borro" },
      { property: "og:description", content: "Reserveer een jurk via Borro." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Reserveren,
});

function Reserveren() {
  const { dress } = Route.useLoaderData();
  const { van, tot, levering } = Route.useSearch();
  const owner = getProfile(dress.ownerId);
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const from = van ? new Date(van) : new Date();
  const to = tot ? new Date(tot) : new Date(Date.now() + 3 * 86_400_000);
  const days = daysBetween(from, to);
  const delivery: DeliveryMethod = levering ?? "pickup";

  const send = () => {
    setLoading(true);
    createReservation({
      dressId: dress.id,
      from: from.toISOString().slice(0, 10),
      to: to.toISOString().slice(0, 10),
      delivery,
      message: message.trim(),
    });
    setTimeout(() => {
      setLoading(false);
      toast.success("Reserveringsverzoek verstuurd", {
        description: `${owner.firstName} krijgt een melding en bevestigt je aanvraag. Je betaalt pas na bevestiging.`,
      });
      void navigate({ to: "/account/huuritems" });
    }, 700);
  };

  return (
    <div className="container-page py-12 lg:py-20">
      <nav className="text-xs text-muted-foreground">
        <Link to="/jurken/$id" params={{ id: dress.id }} className="hover:text-primary">
          Terug naar de jurk
        </Link>
      </nav>

      <h1 className="display mt-6 text-3xl sm:text-4xl">Reserveren</h1>
      <p className="mt-3 max-w-xl text-muted-foreground">
        Stap 2 van 3. Je stuurt eerst een reserveringsverzoek. {owner.firstName} bevestigt of de
        jurk in deze periode beschikbaar is — daarna reken je af.
      </p>

      <div className="mt-12 grid gap-14 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-20">
        <div className="min-w-0 space-y-12">
          <section>
            <h2 className="text-sm font-medium">Jouw jurk</h2>
            <div className="mt-4 flex gap-5 border-t border-border pt-5">
              <img
                src={dress.images[0]}
                alt={dress.title}
                loading="lazy"
                className="aspect-[3/4] w-24 shrink-0 rounded-2xl object-cover"
              />
              <div className="min-w-0">
                <p className="eyebrow">{dress.brand}</p>
                <p className="mt-1">{dress.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Maat {dress.size} · van {owner.firstName} · {dress.area}
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-sm font-medium">Huurperiode en levering</h2>
            <p className="mt-4 border-t border-border pt-5 text-[0.9375rem]">
              {formatDateNL(from)} — {formatDateNL(to)}
              <span className="text-muted-foreground"> · {days} dagen</span>
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {delivery === "pickup"
                ? `Ophalen in ${dress.area}`
                : `Verzenden voor ${formatEuro(FEES.shippingFee)}`}
            </p>
          </section>

          <section>
            <h2 className="text-sm font-medium">Bericht aan de verhuurder</h2>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="Vertel kort waarvoor je de jurk wilt huren en of je vragen hebt over de maat."
              className="mt-4"
            />
          </section>
        </div>

        <aside>
          <div className="rounded-2xl border border-border bg-card p-8 lg:sticky lg:top-28">
            <StatusBadge tone="brand">Nog niet betaald</StatusBadge>
            <h2 className="mt-4 text-sm font-medium">Wat je straks betaalt</h2>
            <div className="mt-6">
              <PriceBreakdown
                basePrice={dress.basePrice}
                days={days}
                delivery={delivery}
                deposit={dress.deposit}
              />
            </div>

            <Button className="mt-8 w-full" size="lg" loading={loading} onClick={send}>
              Verstuur reserveringsverzoek
            </Button>

            <p className="mt-4 text-xs text-muted-foreground">
              Je betaalt pas nadat de verhuurder je reservering bevestigt. Je vindt de status terug
              bij Mijn huuritems.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
