import { Link, useRouterState } from "@tanstack/react-router";
import { Bell, Heart, Menu, MessageSquare, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/store";
import { useIsTeamAdmin } from "@/lib/admin";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/jurken", label: "Jurken huren" },
  { to: "/verhuren", label: "Verhuren" },
  { to: "/bedrijven", label: "Bedrijven" },
  { to: "/over-ons", label: "Over ons" },
] as const;

export function Header() {
  const { user } = useApp();
  const { isAdmin } = useIsTeamAdmin();
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="container-page relative grid h-16 grid-cols-[minmax(0,1fr)_auto] items-center gap-4 lg:h-20 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
        <nav className="hidden items-center gap-10 lg:flex">
          {nav.slice(0, 2).map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-sm text-foreground transition-colors hover:text-primary"
              activeProps={{ className: "text-primary" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          to="/"
          className="font-serif absolute left-1/2 shrink-0 -translate-x-1/2 text-2xl uppercase text-primary lg:text-3xl"
        >
          Borro
        </Link>

        <div className="hidden items-center justify-end gap-1 lg:col-start-3 lg:flex">
          {nav.slice(2).map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="mr-7 text-sm text-foreground transition-colors hover:text-primary"
              activeProps={{ className: "text-primary" }}
            >
              {item.label}
            </Link>
          ))}
          {user ? (
            <>
              <IconLink to="/account/favorieten" label="Favorieten">
                <Heart />
              </IconLink>
              <IconLink to="/account/berichten" label="Berichten">
                <MessageSquare />
              </IconLink>
              <IconLink to="/account/meldingen" label="Meldingen">
                <Bell />
              </IconLink>
              {isAdmin ? (
                <Button variant="quiet" size="sm" asChild className="ml-2">
                  <Link to="/beheer/jurken">Beheer</Link>
                </Button>
              ) : null}
              <Button variant="ghost" size="sm" asChild className="ml-2">
                <Link to="/account">
                  <User />
                  {user.name.split(" ")[0]}
                </Link>
              </Button>
            </>
          ) : (
            <>
              <Button variant="quiet" size="sm" asChild className="mr-6">
                <Link to="/inloggen">Inloggen</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/aanmelden">Aanmelden</Link>
              </Button>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Menu sluiten" : "Menu openen"}
          aria-expanded={open}
          className="grid size-10 shrink-0 place-items-center justify-self-end lg:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open ? (
        <div className="fixed inset-x-0 top-16 bottom-0 z-50 flex flex-col bg-background/98 backdrop-blur-md lg:hidden">
          <nav className="container-page flex flex-1 flex-col overflow-y-auto py-6">
            <div className="flex flex-col divide-y divide-border">
              {nav.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="flex min-h-[48px] items-center py-4 text-base font-medium text-foreground transition-colors hover:text-primary active:bg-muted/50"
                  activeProps={{ className: "text-primary font-semibold" }}
                >
                  {item.label}
                </Link>
              ))}
              {user ? (
                <Link
                  to="/account"
                  className="flex min-h-[48px] items-center py-4 text-base font-medium text-foreground transition-colors hover:text-primary"
                >
                  Mijn account ({user.name})
                </Link>
              ) : (
                <div className="flex flex-col gap-3 pt-6">
                  <Button size="lg" className="w-full" asChild>
                    <Link to="/aanmelden">Aanmelden</Link>
                  </Button>
                  <Button size="lg" variant="outline" className="w-full" asChild>
                    <Link to="/inloggen">Inloggen</Link>
                  </Button>
                </div>
              )}
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

function IconLink({
  to,
  label,
  children,
}: {
  to: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      aria-label={label}
      title={label}
      className={cn(
        "grid size-10 place-items-center text-foreground transition-colors hover:text-primary [&_svg]:size-[1.15rem]",
      )}
      activeProps={{ className: "text-primary" }}
    >
      {children}
    </Link>
  );
}
