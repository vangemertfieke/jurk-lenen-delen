import { createFileRoute } from "@tanstack/react-router";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { DressCard } from "@/components/dressloop/DressCard";
import { EmptyState, Field } from "@/components/dressloop/primitives";
import { filterVisible, useListingStates } from "@/lib/listing-state";
import { brands, cities, colors, getDresses, occasions, sizes } from "@/lib/mock-data";
import { formatEuro } from "@/lib/config";

interface JurkenSearch {
  gelegenheid?: string | undefined;
  q?: string | undefined;
}


export const Route = createFileRoute("/jurken/")({
  validateSearch: (search: Record<string, unknown>): JurkenSearch => ({
    gelegenheid: typeof search["gelegenheid"] === "string" ? search["gelegenheid"] : undefined,
    q: typeof search["q"] === "string" ? search["q"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Jurken huren — Borro" },
      {
        name: "description",
        content:
          "Blader door unieke jurken van vrouwen in heel Nederland. Filter op maat, merk, kleur, gelegenheid, prijs en locatie.",
      },
      { property: "og:title", content: "Jurken huren — Borro" },
      {
        property: "og:description",
        content: "Vind jouw jurk voor een bruiloft, gala, festival of diner.",
      },
    ],
  }),
  component: Jurken,
});

const ALLE = "alle";

function Jurken() {
  const { gelegenheid, q: initialQuery } = Route.useSearch();
  const [query, setQuery] = useState(initialQuery ?? "");
  const [size, setSize] = useState(ALLE);
  const [brand, setBrand] = useState(ALLE);
  const [color, setColor] = useState(ALLE);
  const [occasion, setOccasion] = useState(gelegenheid ?? ALLE);
  const [city, setCity] = useState(ALLE);
  const [delivery, setDelivery] = useState(ALLE);
  const [available, setAvailable] = useState(ALLE);
  const [maxPrice, setMaxPrice] = useState(100);
  const [sort, setSort] = useState("aanbevolen");

  const reset = () => {
    setQuery("");
    setSize(ALLE);
    setBrand(ALLE);
    setColor(ALLE);
    setOccasion(ALLE);
    setCity(ALLE);
    setDelivery(ALLE);
    setAvailable(ALLE);
    setMaxPrice(100);
  };

  const results = useMemo(() => {
    let list = filterVisible(listingStates, getDresses()).filter((d) => {
      const q = query.trim().toLowerCase();
      if (q && !`${d.brand} ${d.title} ${d.color} ${d.occasion}`.toLowerCase().includes(q))
        return false;
      if (size !== ALLE && d.size !== size) return false;
      if (brand !== ALLE && d.brand !== brand) return false;
      if (color !== ALLE && d.color !== color) return false;
      if (occasion !== ALLE && d.occasion !== occasion) return false;
      if (city !== ALLE && d.city !== city) return false;
      if (delivery === "pickup" && d.delivery === "shipping") return false;
      if (delivery === "shipping" && d.delivery === "pickup") return false;
      if (d.basePrice > maxPrice) return false;
      return true;
    });

    if (available === "deze-maand") list = list.filter((d) => d.condition !== "Gedragen");

    switch (sort) {
      case "nieuwste":
        list = [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        break;
      case "prijs-op":
        list = [...list].sort((a, b) => a.basePrice - b.basePrice);
        break;
      case "prijs-af":
        list = [...list].sort((a, b) => b.basePrice - a.basePrice);
        break;
      default:
        list = [...list].sort((a, b) => b.rating - a.rating);
    }
    return list;
  }, [query, size, brand, color, occasion, city, delivery, available, maxPrice, sort]);

  const filters = (
    <div className="space-y-8">
      <Field label="Maat">
        <Choice value={size} onChange={setSize} options={[...sizes]} placeholder="Alle maten" />
      </Field>
      <Field label="Merk">
        <Choice value={brand} onChange={setBrand} options={[...brands]} placeholder="Alle merken" />
      </Field>
      <Field label="Kleur">
        <Choice value={color} onChange={setColor} options={[...colors]} placeholder="Alle kleuren" />
      </Field>
      <Field label="Gelegenheid">
        <Choice
          value={occasion}
          onChange={setOccasion}
          options={[...occasions]}
          placeholder="Alle gelegenheden"
        />
      </Field>
      <Field label="Prijs" hint={`Tot ${formatEuro(maxPrice)} per 4 dagen`}>
        <Slider
          value={[maxPrice]}
          min={20}
          max={100}
          step={5}
          onValueChange={(v) => setMaxPrice(v[0] ?? 100)}
          className="pt-2"
        />
      </Field>
      <Field label="Beschikbaarheid">
        <Choice
          value={available}
          onChange={setAvailable}
          options={["deze-maand"]}
          labels={{ "deze-maand": "Deze maand beschikbaar" }}
          placeholder="Alle datums"
        />
      </Field>
      <Field label="Locatie">
        <Choice value={city} onChange={setCity} options={[...cities]} placeholder="Heel Nederland" />
      </Field>
      <Field label="Ophalen / verzenden">
        <Choice
          value={delivery}
          onChange={setDelivery}
          options={["pickup", "shipping"]}
          labels={{ pickup: "Ophalen mogelijk", shipping: "Verzenden mogelijk" }}
          placeholder="Beide"
        />
      </Field>
      <Button variant="quiet" size="sm" onClick={reset}>
        <X /> Filters wissen
      </Button>
    </div>
  );

  return (
    <div className="container-page py-12 lg:py-20">
      <header className="max-w-2xl">
        <h1 className="display text-4xl sm:text-5xl">Vind jouw jurk</h1>
        <p className="mt-4 text-muted-foreground">
          Unieke jurken van vrouwen in heel Nederland, klaar om gedragen te worden.
        </p>
      </header>

      <div className="mt-10 max-w-xl">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Zoek op merk, kleur of gelegenheid"
            aria-label="Zoeken"
            className="h-12 pl-11"
          />
        </div>
      </div>

      <div className="mt-12 grid gap-12 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-16">
        <aside className="hidden lg:block">{filters}</aside>

        <div className="min-w-0">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-border pb-4">
            <p className="min-w-0 truncate text-sm text-muted-foreground">
              {results.length} {results.length === 1 ? "jurk" : "jurken"}
            </p>
            <div className="flex shrink-0 items-center gap-3">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="lg:hidden">
                    <SlidersHorizontal /> Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="px-4 pb-10">{filters}</div>
                </SheetContent>
              </Sheet>
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="w-[11rem]" aria-label="Sorteren">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aanbevolen">Aanbevolen</SelectItem>
                  <SelectItem value="nieuwste">Nieuwste</SelectItem>
                  <SelectItem value="prijs-op">Prijs laag-hoog</SelectItem>
                  <SelectItem value="prijs-af">Prijs hoog-laag</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {results.length === 0 ? (
            <div className="mt-12">
              <EmptyState
                title="Geen jurken gevonden"
                description="Pas je filters aan of zoek op een ander merk of gelegenheid."
                action={
                  <Button variant="outline" onClick={reset}>
                    Filters wissen
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-3">
              {results.map((d) => (
                <DressCard key={d.id} dress={d} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Choice({
  value,
  onChange,
  options,
  placeholder,
  labels,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
  labels?: Record<string, string>;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALLE}>{placeholder}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {labels?.[o] ?? o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
