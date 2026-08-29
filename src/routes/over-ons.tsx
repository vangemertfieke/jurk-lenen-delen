import { createFileRoute, Link } from "@tanstack/react-router";
import heroImg from "@/assets/hero.jpg";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/dressloop/primitives";

export const Route = createFileRoute("/over-ons")({
  head: () => ({
    meta: [
      { title: "Over DressLoop — delen wat al bestaat" },
      {
        name: "description",
        content:
          "DressLoop is een Nederlandse community waar vrouwen jurken van elkaar huren. Minder kopen, meer dragen.",
      },
      { property: "og:title", content: "Over DressLoop" },
      { property: "og:description", content: "Minder kopen, meer dragen." },
    ],
  }),
  component: OverOns,
});

function OverOns() {
  return (
    <>
      <section className="container-page py-16 lg:py-24">
        <div className="max-w-3xl">
          <p className="eyebrow">Over ons</p>
          <h1 className="display mt-6 text-4xl sm:text-5xl lg:text-6xl">
            Delen wat er al is.
          </h1>
          <p className="mt-8 max-w-xl text-lg text-muted-foreground">
            De meeste feestjurken worden één of twee keer gedragen. DressLoop brengt die jurken
            terug in omloop: jij draagt iets unieks, iemand anders verdient aan een kast die
            anders stilstaat.
          </p>
        </div>
        <img
          src={heroImg}
          alt="Vrouw in een bordeauxrode jurk"
          loading="lazy"
          width={1408}
          height={1760}
          className="mt-14 aspect-[16/9] w-full object-cover object-[center_25%]"
        />
      </section>

      <section className="border-y border-border bg-offwhite">
        <div className="container-page py-20 lg:py-28">
          <SectionHeading eyebrow="Waar we voor staan" title="Onze uitgangspunten" />
          <div className="mt-12 grid gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { t: "Duurzaam", d: "Elke huur is een jurk die niet nieuw gekocht hoeft te worden." },
              { t: "Betrouwbaar", d: "Echte profielen, eerlijke reviews en duidelijke afspraken." },
              { t: "Toegankelijk", d: "Mooie mode zonder de prijs van mooie mode." },
              { t: "Community", d: "Vrouwen die elkaar helpen aan de juiste jurk." },
              { t: "Transparant", d: "Je ziet altijd de totaalprijs voordat je betaalt." },
              { t: "Nederlands", d: "Gebouwd voor ophalen om de hoek en verzenden binnen NL." },
            ].map((i) => (
              <div key={i.t} className="hairline pt-6">
                <h3 className="text-[0.9375rem] font-medium">{i.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{i.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-20 lg:py-28">
        <SectionHeading eyebrow="Veelgestelde vragen" title="Goed om te weten" />
        <dl className="mt-12 max-w-3xl">
          {[
            {
              q: "Hoe werkt betalen?",
              a: "Je betaalt de volledige huur in één keer via DressLoop. De verhuurder wordt uitbetaald nadat de jurk goed is geretourneerd.",
            },
            {
              q: "Wat als de jurk beschadigd raakt?",
              a: "Meld het direct via je huurdetails. De borg is bedoeld om kleine schade te dekken; jullie kunnen het samen oplossen via de berichten.",
            },
            {
              q: "Kan ik onderhandelen over de prijs?",
              a: "Ja. Als de verhuurder biedingen toestaat kun je een bod doen op de huurprijs voor jouw datums.",
            },
            {
              q: "Ophalen of verzenden?",
              a: "De verhuurder kiest wat mogelijk is. Bij ophalen zie je vooraf alleen de buurt, nooit het exacte adres.",
            },
          ].map((f) => (
            <div key={f.q} className="border-b border-border py-6">
              <dt className="font-medium">{f.q}</dt>
              <dd className="mt-2 text-sm text-muted-foreground">{f.a}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-12 flex flex-wrap gap-4">
          <Button asChild>
            <Link to="/jurken">Huur een jurk</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/verhuren">Verhuur mijn jurk</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
