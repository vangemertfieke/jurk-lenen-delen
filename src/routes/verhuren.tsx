import { createFileRoute, Link } from "@tanstack/react-router";
import { ImagePlus, Trash2 } from "lucide-react";
import { useState } from "react";
import { nl } from "date-fns/locale";
import { toast } from "sonner";
import dress1 from "@/assets/dress-1.jpg";
import dress3 from "@/assets/dress-3.jpg";
import dress4 from "@/assets/dress-4.jpg";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Field, StatusBadge } from "@/components/dressloop/primitives";
import { cities, colors, conditions, occasions, sizes } from "@/lib/mock-data";
import { FEES, calculateOwnerPayout, formatEuro } from "@/lib/config";
import { useApp } from "@/lib/store";
import {
  PROTECTION_CONFIG,
  calculateDeposit,
  isValueSuspicious,
} from "@/lib/rental/config";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/verhuren")({
  head: () => ({
    meta: [
      { title: "Verhuur je jurk — Borro" },
      {
        name: "description",
        content:
          "Plaats in een paar stappen een jurk uit je eigen kast en verdien aan een jurk die je al hebt.",
      },
      { property: "og:title", content: "Verhuur je jurk — Borro" },
      { property: "og:description", content: "Laat je jurk niet in de kast hangen." },
    ],
  }),
  component: Verhuren,
});

const steps = [
  "Foto's",
  "Details",
  "Prijs",
  "Beschikbaarheid",
  "Levering",
  "Controleren",
] as const;

const starterPhotos = [dress1, dress3, dress4];

function Verhuren() {
  const { user, hydrated } = useApp();
  const [step, setStep] = useState(0);
  const [photos, setPhotos] = useState<string[]>([]);
  const [cover, setCover] = useState(0);

  const [brand, setBrand] = useState("");
  const [title, setTitle] = useState("");
  const [occasion, setOccasion] = useState("");
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [condition, setCondition] = useState("");
  const [fit, setFit] = useState("Valt normaal");
  const [description, setDescription] = useState("");

  const [price, setPrice] = useState("55");
  const [originalPrice, setOriginalPrice] = useState("250");
  const [estimatedValue, setEstimatedValue] = useState("150");
  const [allowOffers, setAllowOffers] = useState(true);

  const [blocked, setBlocked] = useState<Date[]>([]);
  const [delivery, setDelivery] = useState("both");
  const [city, setCity] = useState("Amsterdam");
  const [area, setArea] = useState("Amsterdam Zuid");

  const numericPrice = Number(price.replace(",", ".")) || 0;
  const numericOriginal = Number(originalPrice.replace(",", ".")) || 0;
  const numericValue = Number(estimatedValue.replace(",", ".")) || numericOriginal;
  const autoDeposit = calculateDeposit(numericValue);
  const valueFlagged = isValueSuspicious(numericOriginal, numericValue);
  const payout = calculateOwnerPayout(numericPrice);

  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const publish = () => {
    toast.success("Jurk gepubliceerd", {
      description: "In deze demo wordt je jurk lokaal getoond en nog niet echt geplaatst.",
    });
  };

  if (!hydrated) {
    return <div className="container-page py-24" aria-hidden />;
  }

  if (!user) {
    return <VerhuurGate />;
  }

  return (
    <div className="container-page py-12 lg:py-20">
      <header className="max-w-2xl">
        <p className="eyebrow">Verhuren</p>
        <h1 className="display mt-5 text-4xl sm:text-5xl">Verhuur je jurk</h1>
        <p className="mt-4 text-muted-foreground">
          In zes rustige stappen staat je jurk online. Je kunt tussendoor altijd opslaan als
          concept.
        </p>
      </header>

      {/* Progress */}
      <ol className="mt-14 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 lg:grid-cols-6">
        {steps.map((label, i) => (
          <li key={label}>
            <button
              type="button"
              onClick={() => setStep(i)}
              className={cn(
                "w-full border-t pt-3 text-left transition-colors",
                i === step ? "border-primary text-primary" : "border-border text-muted-foreground",
              )}
            >
              <span className="price block text-xs">0{i + 1}</span>
              <span className="mt-1 block text-sm">{label}</span>
            </button>
          </li>
        ))}
      </ol>

      <div className="mt-14 grid gap-16 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-20">
        <div className="min-w-0 max-w-2xl">
          {step === 0 ? (
            <section className="space-y-8">
              <div>
                <h2 className="text-lg font-medium">Foto's</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Fotografeer bij daglicht tegen een rustige achtergrond. Een foto waarop je de
                  jurk draagt werkt het beste, aangevuld met een detailfoto van de stof.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {photos.map((src, i) => (
                  <div key={`${src}-${i}`} className="group relative">
                    <img
                      src={src}
                      alt={`Foto ${i + 1}`}
                      loading="lazy"
                      className="aspect-[3/4] w-full object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-card/90 px-2 py-1.5">
                      <button
                        type="button"
                        onClick={() => setCover(i)}
                        className={cn(
                          "text-[0.6875rem] uppercase tracking-[0.1em]",
                          i === cover ? "text-primary" : "text-muted-foreground",
                        )}
                      >
                        {i === cover ? "Omslagfoto" : "Maak omslag"}
                      </button>
                      <button
                        type="button"
                        aria-label="Foto verwijderen"
                        onClick={() => {
                          setPhotos((p) => p.filter((_, idx) => idx !== i));
                          setCover(0);
                        }}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() =>
                    setPhotos((p) => [...p, starterPhotos[p.length % starterPhotos.length] ?? dress1])
                  }
                  className="flex aspect-[3/4] flex-col items-center justify-center gap-3 border border-dashed border-border-strong text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  <ImagePlus className="size-5" />
                  Foto toevoegen
                </button>
              </div>
            </section>
          ) : null}

          {step === 1 ? (
            <section className="space-y-8">
              <h2 className="text-lg font-medium">Details</h2>
              <Field label="Merk" htmlFor="merk">
                <Input id="merk" value={brand} onChange={(e) => setBrand(e.target.value)} className="h-12" />
              </Field>
              <Field label="Titel" htmlFor="titel" hint="Bijvoorbeeld: Lucille maxi dress">
                <Input id="titel" value={title} onChange={(e) => setTitle(e.target.value)} className="h-12" />
              </Field>
              <div className="grid gap-8 sm:grid-cols-2">
                <Field label="Gelegenheid">
                  <Picker value={occasion} onChange={setOccasion} options={[...occasions]} placeholder="Kies" />
                </Field>
                <Field label="Maat">
                  <Picker value={size} onChange={setSize} options={[...sizes]} placeholder="Kies" />
                </Field>
                <Field label="Kleur">
                  <Picker value={color} onChange={setColor} options={[...colors]} placeholder="Kies" />
                </Field>
                <Field label="Staat">
                  <Picker value={condition} onChange={setCondition} options={[...conditions]} placeholder="Kies" />
                </Field>
                <Field label="Pasvorm">
                  <Picker
                    value={fit}
                    onChange={setFit}
                    options={["Valt klein", "Valt normaal", "Valt ruim"]}
                    placeholder="Kies"
                  />
                </Field>
              </div>
              <Field label="Beschrijving" htmlFor="omschrijving" hint="Vertel wanneer je de jurk droeg en hoe hij zit.">
                <Textarea
                  id="omschrijving"
                  rows={6}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </Field>
            </section>
          ) : null}

          {step === 2 ? (
            <section className="space-y-8">
              <h2 className="text-lg font-medium">Prijs</h2>
              <Field
                label={`Huurprijs voor ${FEES.baseRentalDays} dagen`}
                htmlFor="prijs"
                hint="Langere periodes worden automatisch berekend."
              >
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                    €
                  </span>
                  <Input
                    id="prijs"
                    inputMode="decimal"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="h-12 pl-9"
                  />
                </div>
              </Field>
              <div className="space-y-6 border border-border p-6">
                <div>
                  <h3 className="text-sm font-medium">Waarde van je jurk</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    We gebruiken dit om een passende borg en bescherming voor de huur te bepalen.
                  </p>
                </div>
                <Field label="Wat was de oorspronkelijke aankoopprijs?" htmlFor="aankoop">
                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                      €
                    </span>
                    <Input
                      id="aankoop"
                      inputMode="decimal"
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(e.target.value)}
                      className="h-12 pl-9"
                    />
                  </div>
                </Field>
                <Field
                  label="Wat is de geschatte huidige waarde? (optioneel)"
                  htmlFor="waarde"
                  hint={`Borro ondersteunt nu jurken tot ongeveer ${formatEuro(PROTECTION_CONFIG.dressValue.supportedMax)}.`}
                >
                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                      €
                    </span>
                    <Input
                      id="waarde"
                      inputMode="decimal"
                      value={estimatedValue}
                      onChange={(e) => setEstimatedValue(e.target.value)}
                      className="h-12 pl-9"
                    />
                  </div>
                </Field>
                <div className="hairline pt-4 text-sm">
                  <div className="flex items-baseline justify-between">
                    <span>Borg voor de huurder</span>
                    <span className="price">{formatEuro(autoDeposit)}</span>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    De borg wordt automatisch berekend (minimaal{" "}
                    {formatEuro(PROTECTION_CONFIG.deposit.min)}, maximaal{" "}
                    {formatEuro(PROTECTION_CONFIG.deposit.max)}). De huurder krijgt dit terug wanneer
                    de jurk volgens afspraak en in goede staat is geretourneerd.
                  </p>
                  {valueFlagged ? (
                    <p className="mt-3 bg-blush px-4 py-3 text-xs text-blush-foreground">
                      We controleren deze waarde even handmatig voordat je jurk live gaat.
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="flex items-center justify-between border-y border-border py-5">
                <div className="min-w-0 pr-6">
                  <p className="text-sm font-medium">Biedingen toestaan</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Huurders kunnen een bod doen op je huurprijs.
                  </p>
                </div>
                <Switch checked={allowOffers} onCheckedChange={setAllowOffers} />
              </div>

              <div className="bg-blush px-6 py-6">
                <p className="eyebrow">Geschatte opbrengst</p>
                <p className="price mt-3 text-2xl text-primary">{formatEuro(payout.payout)}</p>
                <dl className="mt-4 space-y-2 text-sm text-blush-foreground/80">
                  <div className="flex justify-between">
                    <dt>Huurprijs</dt>
                    <dd className="price">{formatEuro(payout.rental)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Borro commissie ({Math.round(FEES.ownerCommissionRate * 100)}%)</dt>
                    <dd className="price">−{formatEuro(payout.commission)}</dd>
                  </div>
                </dl>
              </div>
            </section>
          ) : null}

          {step === 3 ? (
            <section className="space-y-8">
              <div>
                <h2 className="text-lg font-medium">Beschikbaarheid</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Selecteer de dagen waarop je jurk niet beschikbaar is. Alle andere dagen kunnen
                  geboekt worden.
                </p>
              </div>
              <div className="inline-block border border-border bg-card p-4">
                <Calendar
                  mode="multiple"
                  locale={nl}
                  selected={blocked}
                  onSelect={(d) => setBlocked(d ?? [])}
                  disabled={{ before: new Date() }}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {blocked.length === 0
                  ? "Nog geen dagen geblokkeerd."
                  : `${blocked.length} dagen geblokkeerd.`}
              </p>
            </section>
          ) : null}

          {step === 4 ? (
            <section className="space-y-8">
              <div>
                <h2 className="text-lg font-medium">Levering</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Jij bepaalt hoe huurders de jurk krijgen. Beide opties aanbieden levert de meeste
                  boekingen op.
                </p>
              </div>
              <RadioGroup value={delivery} onValueChange={setDelivery} className="space-y-3">
                {[
                  {
                    v: "both",
                    l: "Ophalen en verzenden",
                    d: "Aanbevolen — de huurder kiest zelf.",
                  },
                  { v: "pickup", l: "Alleen ophalen", d: "De huurder komt langs bij jou." },
                  { v: "shipping", l: "Alleen verzenden", d: "Je verstuurt de jurk met PostNL." },
                ].map((o) => (
                  <label
                    key={o.v}
                    className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border px-4 py-4 text-sm has-[:checked]:border-primary"
                  >
                    <RadioGroupItem value={o.v} className="mt-0.5" />
                    <span>
                      <span className="block">{o.l}</span>
                      <span className="block text-xs text-muted-foreground">{o.d}</span>
                    </span>
                  </label>
                ))}
              </RadioGroup>

              {delivery !== "shipping" ? (
                <div className="grid gap-8 sm:grid-cols-2">
                  <Field label="Stad">
                    <Picker value={city} onChange={setCity} options={[...cities]} placeholder="Kies" />
                  </Field>
                  <Field
                    label="Buurt"
                    htmlFor="buurt"
                    hint="Alleen de buurt is zichtbaar. Je exacte adres deel je pas na een bevestigde boeking."
                  >
                    <Input id="buurt" value={area} onChange={(e) => setArea(e.target.value)} className="h-12" />
                  </Field>
                </div>
              ) : null}
            </section>
          ) : null}

          {step === 5 ? (
            <section className="space-y-8">
              <h2 className="text-lg font-medium">Controleren</h2>
              <p className="text-sm text-muted-foreground">
                Dit is hoe je jurk er straks uitziet voor huurders.
              </p>

              <article className="max-w-xs">
                <div className="bg-muted">
                  {photos.length > 0 ? (
                    <img
                      src={photos[cover] ?? photos[0]}
                      alt={title || "Voorbeeld"}
                      className="aspect-[3/4] w-full object-cover"
                    />
                  ) : (
                    <div className="grid aspect-[3/4] w-full place-items-center text-sm text-muted-foreground">
                      Nog geen foto
                    </div>
                  )}
                </div>
                <div className="mt-4 space-y-1">
                  <p className="text-[0.6875rem] uppercase tracking-[0.16em] text-muted-foreground">
                    {brand || "Merk"}
                  </p>
                  <h3 className="text-[0.9375rem]">{title || "Titel van je jurk"}</h3>
                  <p className="text-sm text-muted-foreground">Maat {size || "—"}</p>
                  <p className="price pt-1 text-sm">
                    {formatEuro(numericPrice)} / {FEES.baseRentalDays} dagen
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {delivery === "shipping" ? "Verzenden mogelijk" : area}
                  </p>
                </div>
              </article>

              <div className="flex flex-wrap items-center gap-6">
                <Button size="lg" onClick={publish}>
                  Publiceer jurk
                </Button>
                <Button
                  variant="quiet"
                  onClick={() => toast("Bewaard als concept", { description: "Je vindt het terug bij Mijn verhuur." })}
                >
                  Bewaar als concept
                </Button>
              </div>
            </section>
          ) : null}

          {step < steps.length - 1 ? (
            <div className="mt-14 flex items-center justify-between border-t border-border pt-6">
              <Button variant="quiet" onClick={back} disabled={step === 0}>
                Vorige
              </Button>
              <Button onClick={next}>Volgende</Button>
            </div>
          ) : null}
        </div>

        <aside className="lg:pt-2">
          <div className="border border-border bg-card p-6 lg:sticky lg:top-28">
            <StatusBadge tone="brand">Zo verdien je</StatusBadge>
            <p className="mt-4 text-sm text-muted-foreground">
              Borro houdt {Math.round(FEES.ownerCommissionRate * 100)}% commissie in op de
              huurprijs. Je wordt uitbetaald nadat de jurk goed retour is.
            </p>
            <div className="hairline mt-6 space-y-2 pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Huurprijs</span>
                <span className="price">{formatEuro(payout.rental)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Commissie</span>
                <span className="price">−{formatEuro(payout.commission)}</span>
              </div>
              <div className="hairline flex justify-between pt-3 font-medium">
                <span>Jij ontvangt</span>
                <span className="price">{formatEuro(payout.payout)}</span>
              </div>
            </div>
            <p className="mt-6 text-xs text-muted-foreground">
              Vragen over verhuren?{" "}
              <Link to="/over-ons" className="text-primary hover:underline">
                Lees hoe het werkt
              </Link>
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

const gateSteps: { title: string; text: string }[] = [
  {
    title: "Foto's",
    text: "Fotografeer je jurk bij daglicht, het liefst gedragen, plus een detailfoto van de stof.",
  },
  {
    title: "Details",
    text: "Merk, titel, maat, kleur, staat en hoe de jurk valt. Plus een korte beschrijving.",
  },
  {
    title: "Prijs",
    text: "Bepaal je huurprijs voor vier dagen en eventueel een borg. Je ziet direct wat je overhoudt.",
  },
  {
    title: "Beschikbaarheid",
    text: "Blokkeer de dagen waarop je jurk niet weg kan. Alles daarbuiten kan geboekt worden.",
  },
  {
    title: "Levering",
    text: "Kies ophalen, verzenden of allebei. Je exacte adres deel je pas na een bevestigde boeking.",
  },
  {
    title: "Controleren",
    text: "Bekijk hoe je jurk eruitziet voor huurders en publiceer — of bewaar als concept.",
  },
];

function VerhuurGate() {
  return (
    <div className="container-page py-12 lg:py-20">
      <header className="max-w-2xl">
        <p className="eyebrow">Verhuren</p>
        <h1 className="display mt-5 text-4xl sm:text-5xl">Verhuur je jurk</h1>
        <p className="mt-4 text-muted-foreground">
          Die jurk die één keer per jaar uit de kast komt, kan rustig vaker op pad. Zo ziet het
          eruit om hem op Borro te zetten — in zes rustige stappen.
        </p>
      </header>

      <ol className="mt-14 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {gateSteps.map((s, i) => (
          <li key={s.title} className="border-t border-border pt-4">
            <span className="price block text-xs text-primary">0{i + 1}</span>
            <h2 className="mt-2 text-[0.9375rem] font-medium">{s.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
          </li>
        ))}
      </ol>

      <div className="mt-16 bg-blush px-6 py-8 sm:px-10">
        <div className="grid gap-8 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
          <div>
            <h2 className="display text-2xl sm:text-3xl">Wat levert het op?</h2>
            <p className="mt-3 max-w-xl text-sm text-blush-foreground/80">
              Bij een huurprijs van {formatEuro(55)} houdt Borro{" "}
              {Math.round(FEES.ownerCommissionRate * 100)}% commissie in en ontvang jij{" "}
              {formatEuro(calculateOwnerPayout(55).payout)} per verhuur. Uitbetaling volgt nadat de
              jurk goed retour is.
            </p>
          </div>
          <ul className="space-y-2 text-sm text-blush-foreground/80">
            <li>Eén account om te huren én te verhuren</li>
            <li>Beheer je jurken, aanvragen en agenda</li>
            <li>Veilig betaald krijgen via Borro</li>
          </ul>
        </div>
      </div>

      <div className="mt-16 max-w-xl border-t border-border pt-10">
        <h2 className="display text-2xl sm:text-3xl">Klaar om te beginnen?</h2>
        <p className="mt-4 text-[0.9375rem] text-muted-foreground">
          Om een jurk te plaatsen heb je een Borro-account nodig. Zo weten huurders met wie ze
          te maken hebben en kunnen we je uitbetalen. Aanmelden is gratis en duurt een minuut.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Button size="lg" asChild>
            <Link to="/aanmelden">Account aanmaken en verhuren</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/inloggen">Ik heb al een account</Link>
          </Button>
        </div>
        <p className="mt-8 text-sm text-muted-foreground">
          Nog vragen?{" "}
          <Link to="/veelgestelde-vragen" className="text-primary hover:underline">
            Lees de veelgestelde vragen
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

function Picker({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
