import { createFileRoute, Link } from "@tanstack/react-router";
import closetImg from "@/assets/closet.jpg";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/dressloop/primitives";

export const Route = createFileRoute("/bedrijven")({
  head: () => ({
    meta: [
      { title: "DressLoop voor bedrijven — professioneel jurken verhuren" },
      {
        name: "description",
        content:
          "Professionele verhuurbedrijven kunnen hun collectie op DressLoop aanbieden met een zakelijk profiel, meerdere jurken en inzicht in hun verhuur.",
      },
      { property: "og:title", content: "DressLoop voor bedrijven" },
      {
        property: "og:description",
        content: "Bereik duizenden vrouwen die op zoek zijn naar de juiste jurk.",
      },
    ],
  }),
  component: Bedrijven,
});

function Bedrijven() {
  return (
    <>
      <section className="border-b border-border">
        <div className="container-page grid items-center gap-12 py-16 lg:grid-cols-2 lg:gap-20 lg:py-24">
          <div className="max-w-xl">
            <p className="eyebrow">Voor bedrijven</p>
            <h1 className="display mt-6 text-4xl sm:text-5xl lg:text-6xl">
              Verhuur je professioneel jurken?
            </h1>
            <p className="mt-6 text-[0.9375rem] text-muted-foreground">
              Boetieks en verhuurbedrijven kunnen hun collectie op DressLoop aanbieden naast het
              aanbod van particulieren. Zo bereik je vrouwen die precies op zoek zijn naar de jurk
              die jij in huis hebt.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link to="/aanmelden">Meld je bedrijf aan</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/jurken">Bekijk het aanbod</Link>
              </Button>
            </div>
          </div>
          <img
            src={closetImg}
            alt="Collectie jurken aan een rail"
            width={1400}
            height={1000}
            className="aspect-[7/5] w-full object-cover"
          />
        </div>
      </section>

      <section className="container-page py-20 lg:py-28">
        <SectionHeading
          eyebrow="Wat je krijgt"
          title="Een zakelijk profiel binnen een community"
          intro="Je houdt je eigen identiteit, maar profiteert van het bereik en de betaalstructuur van DressLoop."
        />
        <div className="mt-12 grid gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { t: "Professioneel label", d: "Een duidelijk zakelijk profiel met je bedrijfsnaam." },
            { t: "Grotere collectie", d: "Beheer een uitgebreide voorraad jurken op één plek." },
            { t: "Meerdere plaatsingen", d: "Plaats snel meerdere jurken tegelijk." },
            { t: "Inzichten", d: "Zie welke jurken worden bekeken en geboekt." },
            { t: "Eigen verhuurregels", d: "Stel je eigen periodes, borg en voorwaarden in." },
            { t: "Eén betaalstroom", d: "Alle betalingen lopen via DressLoop." },
          ].map((i) => (
            <div key={i.t} className="hairline pt-6">
              <h3 className="text-[0.9375rem] font-medium">{i.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{i.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-blush">
        <div className="container-page grid gap-8 py-16 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:py-20">
          <div className="max-w-xl">
            <h2 className="display text-2xl sm:text-3xl">Interesse in een zakelijk profiel?</h2>
            <p className="mt-4 text-sm text-blush-foreground/80">
              We werken samen met een beperkt aantal partners aan de eerste versie van DressLoop
              voor bedrijven.
            </p>
          </div>
          <Button size="lg" asChild className="justify-self-start">
            <Link to="/aanmelden">Neem contact op</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
