import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { Heart, MessageSquare } from "lucide-react";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DateRangeField } from "@/components/dressloop/DateRangeField";
import { OfferDialog } from "@/components/dressloop/OfferDialog";
import { InfoRow, Rating, SectionHeading } from "@/components/dressloop/primitives";
import {
  FEES,
  daysBetween,
  formatDateNL,
  formatEuro,
  rentalPriceForDays,
  type DeliveryMethod,
} from "@/lib/config";
import { useListingStates, visibilityOf } from "@/lib/listing-state";
import { getDress, getProfile, getReviewsForDress } from "@/lib/mock-data";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/jurken/$id")({
  loader: ({ params }) => {
    const dress = getDress(params.id);
    if (!dress) throw notFound();
    return { dress };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Jurk niet gevonden — Borro" }, { name: "robots", content: "noindex" }],
      };
    }
    const { dress } = loaderData;
    const title = `${dress.brand} ${dress.title} huren — Borro`;
    const description = `Huur ${dress.title} van ${dress.brand}, maat ${dress.size}, vanaf ${formatEuro(dress.basePrice)} voor ${FEES.baseRentalDays} dagen in ${dress.city}.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: DressDetail,
});

function DressDetail() {
  const { dress } = Route.useLoaderData();
  const owner = getProfile(dress.ownerId);
  const reviews = getReviewsForDress(dress.id);
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useApp();
  const listingStates = useListingStates();
  const visibility = visibilityOf(listingStates, dress.id);
  const unavailable = visibility !== "actief";

  const [active, setActive] = useState(0);
  const [range, setRange] = useState<DateRange | undefined>();
  const [delivery, setDelivery] = useState<DeliveryMethod>(
    dress.delivery === "shipping" ? "shipping" : "pickup",
  );

  const days = range?.from && range?.to ? daysBetween(range.from, range.to) : FEES.baseRentalDays;
  const rental = rentalPriceForDays(dress.basePrice, days);
  const period =
    range?.from && range?.to
      ? `${formatDateNL(range.from)} — ${formatDateNL(range.to)}`
      : "Nog geen datums gekozen";

  const book = () => {
    if (!range?.from || !range?.to) {
      toast.error("Kies eerst je huurperiode.");
      return;
    }
    void navigate({
      to: "/afrekenen/$id",
      params: { id: dress.id },
      search: {
        van: range.from.toISOString().slice(0, 10),
        tot: range.to.toISOString().slice(0, 10),
        levering: delivery,
      },
    });
  };

  return (
    <div className="container-page py-8 lg:py-14">
      <nav className="text-xs text-muted-foreground">
        <Link to="/jurken" className="hover:text-primary">
          Jurken huren
        </Link>
        <span className="px-2">/</span>
        <span>{dress.title}</span>
      </nav>

      <div className="mt-8 grid gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-20">
        {/* Gallery */}
        <div className="min-w-0">
          <div className="lg:hidden">
            <div className="-mx-6 flex snap-x snap-mandatory gap-2 overflow-x-auto px-6 pb-2">
              {dress.images.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={`${dress.title} foto ${i + 1}`}
                  loading={i === 0 ? "eager" : "lazy"}
                  width={900}
                  height={1200}
                  className="aspect-[3/4] w-[85%] shrink-0 snap-center object-cover"
                />
              ))}
            </div>
          </div>

          <div className="hidden lg:block">
            <img
              src={dress.images[active]}
              alt={`${dress.title} foto ${active + 1}`}
              width={900}
              height={1200}
              className="aspect-[3/4] w-full object-cover"
            />
            {dress.images.length > 1 ? (
              <div className="mt-3 flex gap-3">
                {dress.images.map((src, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActive(i)}
                    aria-label={`Bekijk foto ${i + 1}`}
                    className={cn(
                      "w-20 shrink-0 border",
                      i === active ? "border-primary" : "border-transparent",
                    )}
                  >
                    <img
                      src={src}
                      alt=""
                      loading="lazy"
                      className="aspect-[3/4] w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {/* Booking */}
        <div className="min-w-0">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
            <div className="min-w-0">
              <p className="eyebrow">{dress.brand}</p>
              <h1 className="display mt-3 text-3xl sm:text-4xl">{dress.title}</h1>
              <p className="mt-3 text-sm text-muted-foreground">
                Maat {dress.size} · {dress.condition}
              </p>
              <div className="mt-3">
                <Rating value={dress.rating} count={dress.reviewCount} />
              </div>
            </div>
            <button
              type="button"
              onClick={() => toggleFavorite(dress.id)}
              aria-label="Bewaar als favoriet"
              aria-pressed={isFavorite(dress.id)}
              className="grid size-10 shrink-0 place-items-center border border-border transition-colors hover:bg-muted"
            >
              <Heart
                className={cn("size-4", isFavorite(dress.id) && "fill-primary text-primary")}
              />
            </button>
          </div>

          <p className="price mt-8 text-2xl">
            {formatEuro(dress.basePrice)}{" "}
            <span className="text-base font-normal text-muted-foreground">
              / {FEES.baseRentalDays} dagen
            </span>
          </p>

          <div className="mt-10">
            <h2 className="text-sm font-medium">Kies je huurperiode</h2>
            <div className="mt-4">
              <DateRangeField range={range} onChange={setRange} basePrice={dress.basePrice} />
            </div>
          </div>

          <div className="mt-10">
            <h2 className="text-sm font-medium">Ophalen of verzenden</h2>
            <RadioGroup
              value={delivery}
              onValueChange={(v) => setDelivery(v as DeliveryMethod)}
              className="mt-4 space-y-3"
            >
              <label
                className={
                  dress.delivery === "shipping"
                    ? "flex items-center justify-between gap-3 rounded-2xl border border-dashed border-border px-4 py-3 text-sm text-muted-foreground"
                    : "flex cursor-pointer items-center gap-3 rounded-2xl border border-border px-4 py-3 text-sm has-[:checked]:border-primary"
                }
              >
                {dress.delivery === "shipping" ? (
                  <>
                    <span>Ophalen</span>
                    <span className="text-xs">Niet aangeboden door de verhuurder</span>
                  </>
                ) : (
                  <>
                    <RadioGroupItem value="pickup" />
                    Ophalen in {dress.area}
                  </>
                )}
              </label>
              <label
                className={
                  dress.delivery === "pickup"
                    ? "flex items-center justify-between gap-3 rounded-2xl border border-dashed border-border px-4 py-3 text-sm text-muted-foreground"
                    : "flex cursor-pointer items-center gap-3 rounded-2xl border border-border px-4 py-3 text-sm has-[:checked]:border-primary"
                }
              >
                {dress.delivery === "pickup" ? (
                  <>
                    <span>Verzenden</span>
                    <span className="text-xs">Niet aangeboden door de verhuurder</span>
                  </>
                ) : (
                  <>
                    <RadioGroupItem value="shipping" />
                    Verzenden vanaf {formatEuro(FEES.shippingFee)}
                  </>
                )}
              </label>
            </RadioGroup>
            <p className="mt-3 text-xs text-muted-foreground">
              De verhuurder bepaalt zelf welke opties beschikbaar zijn voor deze jurk.
            </p>
          </div>

          <div className="mt-10">
            {unavailable ? (
              <p className="mb-5 rounded-2xl border border-border bg-muted/50 p-4 text-sm text-muted-foreground">
                {visibility === "verwijderd"
                  ? "De verhuurder heeft deze jurk uit het aanbod gehaald."
                  : "De verhuurder heeft deze jurk tijdelijk op pauze gezet."}
              </p>
            ) : null}
            <Button size="lg" className="w-full" onClick={book} disabled={unavailable}>
              Huur deze jurk
            </Button>
            <div className="mt-5 flex flex-wrap items-center gap-x-8 gap-y-3">
              {dress.allowsOffers ? (
                <OfferDialog
                  normalPrice={rental}
                  period={period}
                  trigger={
                    <Button variant="quiet" size="sm">
                      Doe een bod
                    </Button>
                  }
                />
              ) : null}
              <Button variant="quiet" size="sm" asChild>
                <Link to="/account/berichten">
                  <MessageSquare /> Stuur een bericht
                </Link>
              </Button>
            </div>
            <p className="mt-6 text-xs text-muted-foreground">
              Veilig betalen via Borro. Je betaalt pas bij het afronden van je boeking.
            </p>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="mt-24 grid gap-16 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-20">
        <div className="min-w-0 space-y-16">
          <section>
            <h2 className="text-lg font-medium">Over deze jurk</h2>
            <dl className="mt-6">
              <InfoRow label="Merk" value={dress.brand} />
              <InfoRow label="Maat" value={dress.size} />
              <InfoRow label="Kleur" value={dress.color} />
              <InfoRow label="Staat" value={dress.condition} />
              <InfoRow label="Gelegenheid" value={dress.occasion} />
              <InfoRow label="Pasvorm" value={dress.fit} />
            </dl>
          </section>

          <section>
            <h2 className="text-lg font-medium">Beschrijving</h2>
            <p className="mt-4 max-w-2xl text-[0.9375rem] text-muted-foreground">
              {dress.description}
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium">Ophalen &amp; verzenden</h2>
            <div className="mt-4 max-w-2xl space-y-3 text-[0.9375rem] text-muted-foreground">
              <p>
                {dress.delivery !== "shipping"
                  ? `Ophalen mogelijk in ${dress.area}. Het exacte adres ontvang je zodra de boeking bevestigd is.`
                  : "Ophalen wordt voor deze jurk niet aangeboden."}
              </p>
              <p>
                {dress.delivery !== "pickup"
                  ? `Verzenden mogelijk vanaf ${formatEuro(FEES.shippingFee)}. De jurk wordt gestoomd en in een kledinghoes verstuurd.`
                  : "Verzenden wordt voor deze jurk niet aangeboden."}
              </p>
            </div>
          </section>

          <section>
            <SectionHeading title="Reviews" className="lg:hidden" />
            <h2 className="hidden text-lg font-medium lg:block">Reviews</h2>
            <ul className="mt-6 space-y-8">
              {reviews.map((r) => (
                <li key={r.id} className="hairline pt-6">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-9">
                      <AvatarFallback>{r.authorName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{r.authorName}</p>
                      <p className="text-xs text-muted-foreground">
                        {r.date} · huurde {r.dressTitle}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <Rating value={r.rating} />
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{r.text}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Owner */}
        <aside>
          <div className="border border-border bg-card p-8">
            <p className="eyebrow">Verhuurd door</p>
            <div className="mt-6 flex items-center gap-4">
              <Avatar className="size-14">
                <AvatarFallback>{owner.firstName[0]}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="font-medium">{owner.firstName}</p>
                <p className="text-sm text-muted-foreground">{owner.city}</p>
              </div>
            </div>
            <div className="mt-6 space-y-2 text-sm">
              <Rating value={owner.rating} />
              <p className="text-muted-foreground">
                {owner.completedRentals} verhuringen afgerond
              </p>
              <p className="text-muted-foreground">Lid sinds {owner.memberSince}</p>
            </div>
            <div className="mt-8">
              <Button variant="outline" className="w-full" asChild>
                <Link to="/account/profiel">Bekijk profiel</Link>
              </Button>
            </div>
          </div>
        </aside>
      </div>

      {/* Sticky mobile CTA */}
      <div className="fixed inset-x-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom,0px))] z-30 border-t border-border bg-background/98 px-6 py-3 backdrop-blur-sm lg:hidden">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
          <div className="min-w-0">
            <p className="price text-sm">{formatEuro(rental)}</p>
            <p className="truncate text-xs text-muted-foreground">{period}</p>
          </div>
          <Button onClick={book} className="shrink-0" disabled={unavailable}>
            {unavailable ? "Niet beschikbaar" : "Huur deze jurk"}
          </Button>
        </div>
      </div>
    </div>
  );
}
