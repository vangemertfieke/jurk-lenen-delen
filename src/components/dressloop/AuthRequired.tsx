import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/store";

/**
 * Toont de inhoud alleen aan ingelogde gebruikers. Huren en verhuren kan
 * alleen met een Borro-account.
 */
export function AuthRequired({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  const { user, hydrated } = useApp();

  if (!hydrated) return null;
  if (user) return <>{children}</>;

  return (
    <div className="container-page py-20 lg:py-28">
      <div className="mx-auto max-w-lg rounded-2xl border border-border bg-card p-8 text-center">
        <p className="eyebrow">Account nodig</p>
        <h1 className="display mt-4 text-3xl">{title}</h1>
        <p className="mt-4 text-sm text-muted-foreground">{description}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="lg">
            <Link to="/aanmelden">Account aanmaken</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/inloggen">Inloggen</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
