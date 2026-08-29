import { Link } from "@tanstack/react-router";
import { Heart, Home, LogIn, MessageSquare, PlusSquare, Search, User } from "lucide-react";
import { useApp } from "@/lib/store";

export function MobileNav() {
  const { user } = useApp();

  const loggedInItems = [
    { to: "/", label: "Home", icon: Home },
    { to: "/jurken", label: "Zoeken", icon: Search },
    { to: "/verhuren", label: "Verhuren", icon: PlusSquare },
    { to: "/account/berichten", label: "Berichten", icon: MessageSquare },
    { to: "/account", label: "Profiel", icon: User },
  ] as const;

  const loggedOutItems = [
    { to: "/", label: "Home", icon: Home },
    { to: "/jurken", label: "Zoeken", icon: Search },
    { to: "/verhuren", label: "Verhuren", icon: PlusSquare },
    { to: "/account/favorieten", label: "Favorieten", icon: Heart },
    { to: "/inloggen", label: "Inloggen", icon: LogIn },
  ] as const;

  const items = user ? loggedInItems : loggedOutItems;

  return (
    <nav
      aria-label="Hoofdnavigatie mobiel"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 pb-[calc(0.375rem+env(safe-area-inset-bottom,0px))] pt-1 backdrop-blur-md lg:hidden"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-5">
        {items.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <Link
              to={to}
              activeOptions={{ exact: to === "/" || to === "/account" }}
              className="flex min-h-[44px] flex-col items-center justify-center gap-1 py-1.5 text-[0.6875rem] font-medium text-muted-foreground transition-colors hover:text-primary"
              activeProps={{ className: "text-primary font-semibold" }}
            >
              <Icon className="size-5" />
              <span>{label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
