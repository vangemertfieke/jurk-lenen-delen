import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import heroImg from "@/assets/hero.jpg";
import foundersImg from "@/assets/founders.jpg";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/dressloop/primitives";

export const Route = createFileRoute("/over-ons")({
  head: () => ({
    meta: [
      { title: "Over Borro — delen wat al bestaat" },
      {
        name: "description",
        content:
          "Borro is een Nederlandse community waar vrouwen jurken van elkaar huren. Minder kopen, meer dragen.",
      },
      { property: "og:title", content: "Over Borro" },
      { property: "og:description", content: "Minder kopen, meer dragen." },
    ],
  }),
  component: OverOns,
});

function OverOns() {
  return (
    <>
      {/* Intro — rustig, veel witruimte */}
      <section className="container-page grid items-center gap-12 py-16 lg:grid-cols-2 lg:gap-20 lg:py-24">
        <div>
          <p className="eyebrow">Over ons</p>
          <h1 className="display mt-6 text-4xl sm:text-5xl lg:text-6xl">
            Delen wat er al is.
          </h1>
          <p className="mt-8 max-w-md text-lg text-muted-foreground">
            De meeste feestjurken worden één of twee keer gedragen. Borro brengt die jurken
            terug in omloop: jij draagt iets unieks, iemand anders verdient aan een kast die
            anders stilstaat.
          </p>
          <div className="mt-10 flex flex-wrap gap-8">
            {[
              { n: "1", l: "gedeelde kledingkast" },
              { n: "4", l: "dagen per huur" },
              { n: "∞", l: "keren opnieuw gedragen" },
            ].map((s) => (
              <div key={s.l}>
                <p className="display text-3xl text-primary">{s.n}</p>
                <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
                  {s.l}
                </p>
              </div>
            ))}
          </div>
        </div>
        <img
          src={heroImg}
          alt="Vrouw in een bordeauxrode jurk"
          width={1408}
          height={1760}
          className="aspect-[4/5] w-full rounded-2xl object-cover object-[center_20%]"
        />
      </section>

      {/* Ons verhaal */}
      <section className="container-page grid items-center gap-12 py-16 lg:grid-cols-2 lg:gap-20 lg:py-24">
        <img
          src={foundersImg}
          alt="Senne en Fieke, oprichters van Borro, lachend aan tafel tijdens een gala"
          loading="lazy"
          width={1536}
          height={1024}
          className="aspect-[4/3] w-full rounded-2xl object-cover"
        />
        <div className="max-w-xl">
          <SectionHeading eyebrow="Ons verhaal" title="Van Senne & Fieke" />
          <div className="mt-8 space-y-5 text-[0.9375rem] leading-relaxed text-muted-foreground">
            <p>
              Wij zijn Senne en Fieke, goede vriendinnen met één herkenbaar probleem: voor gala’s,
              diners, bruiloften en andere gelegenheden wilden we steeds weer iets leuks aan. Het
              gevolg? Kasten vol jurken die we soms maar één of twee keer droegen.
            </p>
            <p>
              Steeds opnieuw iets nieuws kopen vonden we zonde — van ons geld én van alle mooie
              jurken die daarna in de kast bleven hangen. Daarom begonnen we steeds vaker jurken
              van vriendinnen te lenen. Ideaal, maar ook een beetje ongemakkelijk: je leent een
              mooie, soms dure jurk, terwijl degene van wie hij is daar niets voor terugkrijgt.
            </p>
            <p>
              Toen we zelf op zoek gingen naar andere mogelijkheden, merkten we hoe lastig het
              eigenlijk is om een mooie en betaalbare jurk in de buurt te vinden die precies op
              jouw datum beschikbaar is. Tegelijkertijd hangen er bij zoveel anderen jurken in de
              kast waar nauwelijks iets mee gebeurt.
            </p>
            <p>
              Dat moest makkelijker kunnen. En zo ontstond Borro.
            </p>
            <p>
              Een gedeelde kledingkast voor Nederland, waar je een jurk kunt huren van iemand
              anders én geld kunt verdienen met de jurken die bij jou in de kast hangen. De één
              vindt voor een betaalbare prijs een outfit voor een bijzondere gelegenheid, de ander
              verdient aan een jurk die anders blijft hangen.
            </p>
            <p>
              Ons idee is simpel: iets nieuws dragen, zonder dat het nieuw hoeft te zijn. Meer
              keuze voor je volgende gelegenheid, extra inkomsten uit je eigen kast en samen zorgen
              we ervoor dat mooie kleding vaker wordt gedragen.
            </p>
            <p className="font-medium text-foreground">— Senne & Fieke<br />Oprichters van Borro</p>
          </div>
        </div>
      </section>

      {/* Uitgangspunten — dusty pink i.p.v. beige */}
      <section className="bg-blush text-blush-foreground">
        <div className="container-page py-16 lg:py-24">
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
              <div key={i.t} className="border-t border-blush-foreground/25 pt-6">
                <h3 className="text-[0.9375rem] font-medium">{i.t}</h3>
                <p className="mt-2 text-sm text-blush-foreground/75">{i.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Afsluiter — bordeaux band, geen beige meer */}
      <section className="bg-primary text-primary-foreground">
        <div className="container-page flex flex-col items-start gap-8 py-16 lg:flex-row lg:items-center lg:justify-between lg:py-24">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground/70">
              De kledingkast van Nederland
            </p>
            <h2 className="display mt-4 text-3xl sm:text-4xl">
              Draag iets moois, zonder iets nieuws te kopen.
            </h2>
          </div>
          <Button
            asChild
            size="lg"
            className="rounded-full bg-primary-foreground text-primary hover:bg-primary-foreground/90"
          >
            <Link to="/jurken">
              Bekijk de jurken
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
