import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/dressloop/primitives";

export const Route = createFileRoute("/veelgestelde-vragen")({
  head: () => ({
    meta: [
      { title: "Veelgestelde vragen — DressLoop" },
      {
        name: "description",
        content:
          "Alles over huren en verhuren op DressLoop: betalen, borg, ophalen of verzenden, schade, annuleren en je account.",
      },
      { property: "og:title", content: "Veelgestelde vragen — DressLoop" },
      {
        property: "og:description",
        content: "Goed om te weten voor huurders en verhuurders.",
      },
    ],
  }),
  component: Faq,
});

const groups = [
  {
    title: "Huren",
    items: [
      {
        q: "Hoe lang huur ik een jurk?",
        a: "De basisperiode is 4 dagen. Je kunt bij het boeken extra dagen toevoegen; de prijs past zich automatisch aan.",
      },
      {
        q: "Hoe werkt betalen?",
        a: "Je betaalt de volledige huur in één keer via DressLoop: huurprijs, servicekosten, eventuele verzending en de borg. De verhuurder wordt pas uitbetaald nadat de jurk goed is geretourneerd.",
      },
      {
        q: "Wat gebeurt er met de borg?",
        a: "De borg wordt gereserveerd en binnen enkele dagen na een goede retour volledig teruggestort.",
      },
      {
        q: "Kan ik onderhandelen over de prijs?",
        a: "Ja. Als de verhuurder biedingen toestaat kun je een bod doen op de huurprijs voor jouw datums. De verhuurder accepteert, weigert of doet een tegenbod.",
      },
      {
        q: "Ophalen of laten verzenden?",
        a: "De verhuurder geeft aan wat mogelijk is. Bij ophalen zie je vooraf alleen de buurt, nooit het exacte adres — dat krijg je na de boeking.",
      },
      {
        q: "Moet ik de jurk laten stomen?",
        a: "Retourneer de jurk zoals je hem ontving. Staat er reiniging in de omschrijving, dan hoor je dat vooraf.",
      },
    ],
  },
  {
    title: "Verhuren",
    items: [
      {
        q: "Heb ik een account nodig om te verhuren?",
        a: "Ja. Je plaatst een jurk alleen met een DressLoop-account, zodat huurders zien met wie ze te maken hebben en jij je uitbetaling kunt ontvangen. Aanmelden is gratis.",
      },
      {
        q: "Wat verdien ik aan een verhuur?",
        a: "Jij bepaalt de huurprijs. DressLoop houdt 10% commissie in; de rest wordt na een goede retour aan jou uitbetaald. Bij het plaatsen zie je direct wat je overhoudt.",
      },
      {
        q: "Wat als mijn jurk beschadigd terugkomt?",
        a: "Meld het binnen 48 uur via de huurdetails. De borg is bedoeld om kleine schade te dekken; komen jullie er samen niet uit, dan bemiddelt DressLoop.",
      },
      {
        q: "Kan ik datums blokkeren?",
        a: "Ja, in je agenda bij het plaatsen of later via Mijn verhuur. Op geblokkeerde datums kan niemand boeken.",
      },
    ],
  },
  {
    title: "Account",
    items: [
      {
        q: "Is aanmelden voor huren of voor verhuren?",
        a: "Voor allebei. Met één DressLoop-account huur je jurken én verhuur je je eigen kast. Je hoeft niets extra's aan te maken om te wisselen.",
      },
      {
        q: "Kan ik mijn account verwijderen?",
        a: "Ja, via Instellingen. Lopende huur- of verhuurperiodes moeten eerst afgerond zijn.",
      },
      {
        q: "Kan ik als bedrijf verhuren?",
        a: "Ja, met een zakelijk profiel bied je een hele collectie aan. Lees meer op de pagina voor bedrijven.",
      },
    ],
  },
];

function Faq() {
  return (
    <>
      <section className="container-page py-16 lg:py-24">
        <div className="max-w-3xl">
          <p className="eyebrow">Goed om te weten</p>
          <h1 className="display mt-6 text-4xl sm:text-5xl lg:text-6xl">
            Veelgestelde vragen
          </h1>
          <p className="mt-8 max-w-xl text-lg text-muted-foreground">
            Alles over huren, verhuren en je account. Staat je vraag er niet bij? Stuur ons een
            bericht, we antwoorden meestal binnen een dag.
          </p>
        </div>
      </section>

      <section className="container-page pb-20 lg:pb-28">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-x-20">
          {groups.map((g) => (
            <div key={g.title}>
              <SectionHeading eyebrow={g.title} title={`Vragen over ${g.title.toLowerCase()}`} />
              <Accordion type="single" collapsible className="mt-8">
                {g.items.map((item) => (
                  <AccordionItem key={item.q} value={item.q} className="border-border">
                    <AccordionTrigger className="text-left text-[0.9375rem] font-medium hover:no-underline">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>

        <div className="mt-20 flex flex-wrap gap-4">
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
