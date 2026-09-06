import { Link } from "@tanstack/react-router";

const columns = [
  {
    title: "Huren",
    links: [
      { to: "/jurken", label: "Alle jurken" },
      { to: "/jurken", label: "Bruiloft" },
      { to: "/jurken", label: "Gala" },
    ],
  },
  {
    title: "Verhuren",
    links: [
      { to: "/verhuren", label: "Verhuur je jurk" },
      { to: "/veelgestelde-vragen", label: "Zo werkt het" },
    ],
  },
  {
    title: "DressLoop",
    links: [
      { to: "/over-ons", label: "Over Borro" },
      { to: "/bedrijven", label: "Voor bedrijven" },
      { to: "/veelgestelde-vragen", label: "Veelgestelde vragen" },
    ],
  },
  {
    title: "Juridisch",
    links: [
      { to: "/over-ons", label: "Voorwaarden" },
      { to: "/over-ons", label: "Privacy" },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-border bg-offwhite">
      <div className="container-page py-16 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,2fr)]">
          <div className="max-w-sm">
            <p className="font-serif text-3xl uppercase text-primary">Borro</p>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              De kledingkast van Nederland. Huur unieke jurken van andere vrouwen, of verdien
              aan de jurken die stil in jouw kast hangen.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
            {columns.map((col) => (
              <div key={col.title}>
                <p className="eyebrow mb-5">{col.title}</p>
                <ul className="space-y-3">
                  {col.links.map((l, i) => (
                    <li key={`${l.label}-${i}`}>
                      <Link
                        to={l.to}
                        className="text-sm text-muted-foreground transition-colors hover:text-primary"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="hairline mt-16 flex flex-col gap-2 pt-8 text-xs text-muted-foreground sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} Borro</p>
          <p>Gemaakt in Nederland</p>
        </div>
      </div>
    </footer>
  );
}
