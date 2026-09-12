import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "Mijn account — Borro" },
      { name: "description", content: "Beheer je huuritems, verhuur, berichten en profiel." },
      { property: "og:title", content: "Mijn account — Borro" },
      { property: "og:description", content: "Jouw huuritems, verhuur en berichten." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AccountLayout,
});

const navGroups: { label: string; items: { to: string; label: string; exact?: boolean }[] }[] = [
  {
    label: "Ik huur",
    items: [
      { to: "/account/huuritems", label: "Mijn huuritems" },
      { to: "/account/favorieten", label: "Favorieten" },
    ],
  },
  {
    label: "Ik verhuur",
    items: [{ to: "/account/verhuur", label: "Mijn verhuur" }],
  },
  {
    label: "Account",
    items: [
      { to: "/account", label: "Overzicht", exact: true },
      { to: "/account/berichten", label: "Berichten" },
      { to: "/account/meldingen", label: "Meldingen" },
      { to: "/account/profiel", label: "Profiel" },
      { to: "/account/instellingen", label: "Instellingen" },
    ],
  },
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
          <nav className="mt-2 flex gap-6 overflow-x-auto pb-2 lg:flex-col lg:gap-0 lg:overflow-visible lg:pb-0">
            {navGroups.map((group) => (
              <div key={group.label} className="shrink-0 lg:mt-8 lg:first:mt-0">
                <p className="eyebrow mb-1 px-3 text-xs font-semibold text-primary lg:mb-2 lg:px-0">
                  {group.label}
                </p>
                <div className="flex gap-1 lg:flex-col lg:gap-0">
                  {group.items.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      activeOptions={{ exact: item.exact ?? false }}
                      className="shrink-0 whitespace-nowrap rounded-full px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground lg:rounded-none lg:border-b lg:border-border lg:px-0 lg:py-2.5"
                      activeProps={{ className: "text-primary" }}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
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
