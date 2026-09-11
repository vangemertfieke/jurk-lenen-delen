import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { PriceBreakdown } from "@/components/dressloop/PriceBreakdown";
import { AuthRequired } from "@/components/dressloop/AuthRequired";
import { StatusBadge } from "@/components/dressloop/primitives";
import { daysBetween, formatDateNL, formatEuro, type DeliveryMethod } from "@/lib/config";
import { getDress, getProfile } from "@/lib/mock-data";

interface CheckoutSearch {
  van?: string | undefined;
  tot?: string | undefined;
  levering?: DeliveryMethod | undefined;
}

export const Route = createFileRoute("/afrekenen/$id")({
  validateSearch: (search: Record<string, unknown>): CheckoutSearch => ({
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
      { title: "Afrekenen — Borro" },
      { name: "description", content: "Rond je huurperiode af en betaal veilig via Borro." },
      { property: "og:title", content: "Afrekenen — Borro" },
      { property: "og:description", content: "Veilig betalen via Borro." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Checkout,
});

function Checkout() {
  return (
    <AuthRequired
      title="Afrekenen kan met een account"
      description="Log in of maak een account aan. Zo kun je veilig betalen en je boeking terugvinden."
    >
      <CheckoutInhoud />
    </AuthRequired>
  );
}

function CheckoutInhoud() {
  const { dress } = Route.useLoaderData();
  const { van, tot, levering } = Route.useSearch();
  const owner = getProfile(dress.ownerId);
  const navigate = useNavigate();
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const from = van ? new Date(van) : new Date();
  const to = tot ? new Date(tot) : new Date(Date.now() + 3 * 86_400_000);
  const days = daysBetween(from, to);
  const delivery: DeliveryMethod = levering ?? "pickup";

  const confirm = () => {
    if (!agreed) {
      toast.error("Ga akkoord met de huurvoorwaarden om verder te gaan.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Aanvraag verstuurd", {
        description:
          "Dit is een demo-omgeving: er is geen echte betaling gedaan. Je aanvraag staat klaar in Mijn huuritems.",
      });
      void navigate({ to: "/account/huuritems" });
    }, 900);
  };

  return (
    <div className="container-page py-12 lg:py-20">
      <nav className="text-xs text-muted-foreground">
        <Link to="/jurken/$id" params={{ id: dress.id }} className="hover:text-primary">
          Terug naar de jurk
        </Link>
      </nav>

      <h1 className="display mt-6 text-3xl sm:text-4xl">Afrekenen</h1>

      <div className="mt-12 grid gap-14 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-20">
        <div className="min-w-0 space-y-12">
          <section>
            <h2 className="text-sm font-medium">Jouw jurk</h2>
            <div className="mt-4 flex gap-5 border-t border-border pt-5">
              <img
                src={dress.images[0]}
                alt={dress.title}
                loading="lazy"
                width={900}
                height={1200}
                className="aspect-[3/4] w-24 shrink-0 object-cover"
              />
              <div className="min-w-0">
                <p className="eyebrow">{dress.brand}</p>
                <p className="mt-1">{dress.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Maat {dress.size} · van {owner.firstName}
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-sm font-medium">Huurperiode</h2>
            <p className="mt-4 border-t border-border pt-5 text-[0.9375rem]">
              {formatDateNL(from)} — {formatDateNL(to)}
              <span className="text-muted-foreground"> · {days} dagen</span>
            </p>
          </section>

          <section>
            <h2 className="text-sm font-medium">Levering</h2>
            <p className="mt-4 border-t border-border pt-5 text-[0.9375rem]">
              {delivery === "pickup"
                ? `Ophalen in ${dress.area}. Je ontvangt het exacte adres zodra de verhuurder je aanvraag bevestigt.`
                : "Verzenden naar jouw adres. Je ontvangt een track & trace zodra de jurk onderweg is."}
            </p>
          </section>

          <section>
            <h2 className="text-sm font-medium">Borg</h2>
            <div className="mt-4 border-t border-border pt-5">
              <StatusBadge tone="brand">Borg gereserveerd</StatusBadge>
              <p className="mt-3 text-sm text-muted-foreground">
                {formatEuro(dress.deposit)} wordt gereserveerd en volledig terugbetaald wanneer de
                jurk goed is geretourneerd.
              </p>
            </div>
          </section>
        </div>

        <aside>
          <div className="border border-border bg-card p-8 lg:sticky lg:top-28">
            <h2 className="text-sm font-medium">Prijsoverzicht</h2>
            <div className="mt-6">
              <PriceBreakdown
                basePrice={dress.basePrice}
                days={days}
                delivery={delivery}
                deposit={dress.deposit}
              />
            </div>

            <label className="mt-8 flex cursor-pointer items-start gap-3 text-sm">
              <Checkbox
                checked={agreed}
                onCheckedChange={(v) => setAgreed(v === true)}
                className="mt-0.5"
              />
              <span className="text-muted-foreground">
                Ik ga akkoord met de huurvoorwaarden en behandel de jurk met zorg.
              </span>
            </label>

            <Button className="mt-6 w-full" size="lg" loading={loading} onClick={confirm}>
              Bevestig en betaal
            </Button>

            <p className="mt-4 text-xs text-muted-foreground">
              Demo-omgeving: er wordt nog geen echte betaling verwerkt. De verhuurder wordt in de
              uiteindelijke opzet pas uitbetaald nadat de jurk goed retour is.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
