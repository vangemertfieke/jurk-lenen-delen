import { Link } from "@tanstack/react-router";

/** Navigatie binnen de interne beheeromgeving van het Borro-team. */
export function AdminTabs() {
  const item =
    "rounded-full border border-border px-4 py-2 text-sm transition-colors hover:border-border-strong";
  const active = { className: `${item} bg-primary text-primary-foreground border-primary` };

  return (
    <nav aria-label="Beheer" className="mt-6 flex flex-wrap gap-2">
      <Link to="/beheer" className={item} activeOptions={{ exact: true }} activeProps={active}>
        Overzicht
      </Link>
      <Link to="/beheer/boekingen" className={item} activeProps={active}>
        Boekingen
      </Link>
      <Link to="/beheer/jurken" className={item} activeProps={active}>
        Jurken &amp; promotie
      </Link>
      <Link to="/beheer/claims" className={item} activeProps={active}>
        Claim Center
      </Link>
    </nav>
  );
}
