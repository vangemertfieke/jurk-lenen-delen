import { Link } from "@tanstack/react-router";
import { Home, MessageSquare, PlusSquare, Search, User } from "lucide-react";
import { useApp } from "@/lib/store";

const items = [
  { to: "/", label: "Home", icon: Home },
  { to: "/jurken", label: "Zoeken", icon: Search },
  { to: "/verhuren", label: "Verhuren", icon: PlusSquare },
  { to: "/account/berichten", label: "Berichten", icon: MessageSquare },
  { to: "/account", label: "Profiel", icon: User },
] as const;

export function MobileNav() {
  const { user } = useApp();
  if (!user) return null;

  return (
    <nav
      aria-label="Hoofdnavigatie"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/98 backdrop-blur-sm lg:hidden"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-5">
        {items.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <Link
              to={to}
              activeOptions={{ exact: to === "/" || to === "/account" }}
              className="flex flex-col items-center gap-1 py-3 text-[0.6875rem] text-muted-foreground"
              activeProps={{ className: "text-primary" }}
            >
              <Icon className="size-5" />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
