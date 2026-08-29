import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "Mijn account — DressLoop" },
      { name: "description", content: "Beheer je huuritems, verhuur, berichten en profiel." },
      { property: "og:title", content: "Mijn account — DressLoop" },
      { property: "og:description", content: "Jouw huuritems, verhuur en berichten." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AccountLayout,
});

const nav: { to: string; label: string; exact?: boolean }[] = [
  { to: "/account", label: "Overzicht", exact: true },
  { to: "/account/huuritems", label: "Mijn huuritems" },
  { to: "/account/verhuur", label: "Mijn verhuur" },
  { to: "/account/favorieten", label: "Favorieten" },
  { to: "/account/berichten", label: "Berichten" },
  { to: "/account/meldingen", label: "Meldingen" },
  { to: "/account/profiel", label: "Profiel" },
  { to: "/account/instellingen", label: "Instellingen" },
];

function AccountLayout() {
  const { user, hydrated } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (hydrated && !user) void navigate({ to: "/inloggen" });
  }, [hydrated, user, navigate]);

  if (!hydrated) {
    return <div className="container-page py-24 text-sm text-muted-foreground">Laden…</div>;
  }

  if (!user) {
    return (
      <div className="container-page py-24">
        <h1 className="display text-3xl">Log in om je account te bekijken</h1>
        <div className="mt-8">
          <Button asChild>
            <Link to="/inloggen">Inloggen</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-10 lg:py-16">
      <div className="grid gap-10 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-20">
        <aside className="min-w-0">
          <p className="eyebrow">Account</p>
          <nav className="-mx-1 mt-5 flex gap-1 overflow-x-auto pb-2 lg:mx-0 lg:flex-col lg:gap-0 lg:overflow-visible lg:pb-0">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.exact ?? false }}
                className="shrink-0 whitespace-nowrap px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground lg:border-b lg:border-border lg:px-0"
                activeProps={{ className: "text-primary" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
