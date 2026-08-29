import { Link, useRouterState } from "@tanstack/react-router";
import { Bell, Heart, Menu, MessageSquare, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { SearchBar } from "@/components/dressloop/SearchBar";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/jurken", label: "Jurken huren" },
  { to: "/verhuren", label: "Verhuren" },
  { to: "/bedrijven", label: "Bedrijven" },
  { to: "/over-ons", label: "Over ons" },
] as const;

export function Header() {
  const { user } = useApp();
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="container-page grid h-16 grid-cols-[minmax(0,1fr)_auto] items-center gap-4 lg:h-20 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
        <div className="flex min-w-0 items-center gap-6">
          <Link
            to="/"
            className="shrink-0 text-[1.0625rem] font-medium tracking-[0.02em] text-primary"
          >
            DressLoop
          </Link>
          <SearchBar variant="compact" className="hidden w-72 md:flex lg:w-80" />
        </div>

        <nav className="hidden justify-center gap-10 lg:flex">
          {nav.map((item) => (
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

        <div className="hidden items-center justify-end gap-1 lg:flex">
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
        <div className="border-t border-border bg-background lg:hidden">
          <nav className="container-page flex flex-col py-4">
            <SearchBar variant="compact" className="mb-4 md:hidden" />
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="border-b border-border py-4 text-[0.9375rem]"
                activeProps={{ className: "text-primary" }}
              >
                {item.label}
              </Link>
            ))}
            {user ? (
              <Link to="/account" className="py-4 text-[0.9375rem]">
                Mijn account
              </Link>
            ) : (
              <div className="flex flex-col gap-3 pt-6">
                <Button asChild>
                  <Link to="/aanmelden">Aanmelden</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/inloggen">Inloggen</Link>
                </Button>
              </div>
            )}
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
