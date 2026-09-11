import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import heroImg from "@/assets/hero.jpg";
import closetImg from "@/assets/closet.jpg";
import { Button } from "@/components/ui/button";
import { DressCard } from "@/components/dressloop/DressCard";
import { NewsletterSignup } from "@/components/dressloop/NewsletterSignup";

import { SectionHeading } from "@/components/dressloop/primitives";
import { filterVisible, useListingStates } from "@/lib/listing-state";
import { getDresses } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Borro — Huur en verhuur jurken in Nederland" },
      {
        name: "description",
        content:
          "Huur unieke jurken van andere vrouwen voor bruiloften, gala's en feesten. Of verdien geld met de jurken die stil in jouw kast hangen.",
      },
      { property: "og:title", content: "Borro — De kledingkast van Nederland" },
      {
        property: "og:description",
        content: "Rent your look. Earn from your closet.",
      },
    ],
  }),
  component: Home,
});

const categories = ["Bruiloft", "Gala", "Festival", "Diner", "Feest", "Vakantie"].map((name) => ({
  name,
}));

const steps = [
  { n: "01", title: "Vind jouw jurk", text: "Zoek op maat, merk, gelegenheid of locatie." },
  { n: "02", title: "Kies je huurperiode", text: "Bekijk de beschikbare datums en de totaalprijs." },
  { n: "03", title: "Haal op of laat bezorgen", text: "Spreek een ophaalmoment af of ontvang de jurk thuis." },
  { n: "04", title: "Draag, straal & retourneer", text: "Stuur de jurk terug en laat een review achter." },
];

/** Populariteit = waardering x aantal reviews, met een bonus voor nieuwe plaatsingen. */
function popularityScore(d: { rating: number; reviewCount: number; createdAt: string }) {
  const days = Math.max(0, (Date.now() - new Date(d.createdAt).getTime()) / 86_400_000);
  const freshness = Math.max(0, 30 - days) / 2;
  return d.rating * d.reviewCount + freshness;
}

function Home() {
  const listingStates = useListingStates();
  const featured = filterVisible(listingStates, [...getDresses()])
    .filter((d) => d.status !== "draft")
    .sort((a, b) => popularityScore(b) - popularityScore(a))
    .slice(0, 8);

  return (
    <>
      {/* Hero */}
      <section className="border-b border-border">
        <div className="container-page grid items-start gap-8 py-10 pb-20 md:pb-10 lg:min-h-[calc(100svh-4rem)] lg:grid-cols-12 lg:items-center lg:gap-16 lg:py-16">
          <div className="order-2 max-w-xl lg:order-1 lg:col-span-5">
            <p className="eyebrow border-b border-border pb-3">
              VOOR GALA'S • BRUILOFTEN • DINERS • EVENTS
            </p>
            <h1 className="display mt-3 text-[clamp(2rem,4.5vw,3.5rem)] leading-[1.05] text-foreground sm:mt-4">
              De kledingkast van Nederland.
            </h1>
            <p className="mt-4 max-w-sm text-xl font-medium leading-snug text-primary sm:text-2xl sm:mt-5">
              Rent your look. Earn from your closet.
            </p>
            <p className="mt-2 max-w-md text-sm sm:text-base text-muted-foreground sm:mt-3">
              Huur een unieke jurk van een andere vrouw in jouw buurt, of verdien geld met de
              jurken die nu ongedragen in jouw kast hangen.
            </p>
            <div className="mt-5 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:mt-6">
              <Button size="lg" className="w-full sm:w-auto" asChild>
                <Link to="/jurken">Huur een jurk</Link>
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
                <Link to="/verhuren">Verhuur mijn jurk</Link>
              </Button>
            </div>
          </div>
          <div className="order-1 relative lg:order-2 lg:col-span-7 lg:flex lg:justify-end">
            <img
              src={heroImg}
              alt="Vrouw in een bordeauxrode zijden maxi-jurk"
              width={1408}
              height={1760}
              className="aspect-[4/5] max-h-[40svh] w-full object-cover sm:max-h-[55svh] lg:max-h-none lg:w-5/6"
            />
            <p className="absolute bottom-5 right-5 bg-primary px-4 py-2 text-xs font-semibold uppercase text-primary-foreground">
              Geleend staat je goed
            </p>
          </div>
        </div>
      </section>

      {/* Discover */}
      <section className="container-page py-14 lg:py-28">
        <SectionHeading
          eyebrow="Ontdek"
          title="Populaire jurken"
          intro="Automatisch bijgewerkt op basis van waarderingen, boekingen en nieuwe plaatsingen."
          action={
            <Link
              to="/jurken"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              Bekijk alle jurken <ArrowRight className="size-4" />
            </Link>
          }
        />

        <div className="-mx-6 px-6 mt-8 flex items-center gap-2 overflow-x-auto no-scrollbar py-1 sm:mx-0 sm:px-0 sm:flex-wrap">
          {categories.map((c) => (
            <Link
              key={c.name}
              to="/jurken"
              search={{ gelegenheid: c.name }}
              className="shrink-0 rounded-full border border-border px-4 py-2 text-xs sm:text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary active:bg-muted"
            >
              {c.name}
            </Link>
          ))}
        </div>

        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-4">
          {featured.map((d) => (
            <DressCard key={d.id} dress={d} />
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-border bg-offwhite">
        <div className="container-page py-20 lg:py-28">
          <SectionHeading eyebrow="Zo werkt het" title="Een jurk huren is zo geregeld" />
          <ol className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
            {steps.map((s) => (
              <li key={s.n} className="hairline pt-6">
                <p className="price text-sm text-primary">{s.n}</p>
                <h3 className="mt-4 text-lg">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Rent out */}
      <section className="bg-blush">
        <div className="container-page grid items-center gap-12 py-20 lg:grid-cols-2 lg:gap-20 lg:py-28">
          <img
            src={closetImg}
            alt="Jurken aan een houten rail in een lichte kamer"
            loading="lazy"
            width={1400}
            height={1000}
            className="aspect-[7/5] w-full object-cover"
          />
          <div className="max-w-md">
            <h2 className="display text-3xl sm:text-4xl lg:text-[2.75rem]">
              Laat je jurk niet in de kast hangen.
            </h2>
            <p className="mt-6 text-[0.9375rem] text-blush-foreground/80">
              De gemiddelde feestjurk wordt één of twee keer gedragen. Verhuur hem aan iemand
              die er blij van wordt en verdien aan een jurk die je al hebt. Jij bepaalt de prijs,
              de datums en of iemand hem ophaalt of dat je hem verstuurt.
            </p>
            <div className="mt-10">
              <Button size="lg" asChild>
                <Link to="/verhuren">Verhuur mijn jurk</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="container-page py-20 lg:py-28">
        <SectionHeading
          eyebrow="Vertrouwen"
          title="Een community die je kunt vertrouwen"
          intro="Borro is gebouwd op echte profielen, eerlijke reviews en duidelijke afspraken."
        />
        <div className="mt-12 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              t: "Veilig betalen via Borro",
              d: "Je betaalt in één keer via het platform, nooit onderling.",
            },
            { t: "Profielen & reviews", d: "Lees ervaringen van eerdere huurders en verhuurders." },
            { t: "Beschermde betalingen", d: "De verhuurder wordt pas uitbetaald na een goede retour." },
            { t: "Ophalen of verzenden", d: "Kies wat het beste past bij jou en de verhuurder." },
          ].map((i) => (
            <div key={i.t} className="hairline pt-6">
              <h3 className="text-[0.9375rem] font-medium">{i.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{i.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Business */}
      <section className="border-t border-border bg-blush">
        <div className="container-page grid gap-8 py-16 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:py-20">
          <div className="max-w-xl">
            <p className="eyebrow">Voor bedrijven</p>
            <h2 className="display mt-4 text-2xl sm:text-3xl">
              Verhuur je professioneel jurken?
            </h2>
            <p className="mt-4 text-sm text-muted-foreground">
              Ook professionele verhuurbedrijven kunnen hun collectie op Borro aanbieden, met
              een zakelijk profiel en meerdere jurken tegelijk.
            </p>
          </div>
          <Button variant="outline" size="lg" asChild className="justify-self-start">
            <Link to="/bedrijven">Borro voor bedrijven</Link>
          </Button>
        </div>
      </section>

      {/* Newsletter */}
      <NewsletterSignup />
    </>
  );
}
