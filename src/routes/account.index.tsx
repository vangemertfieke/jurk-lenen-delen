import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/dressloop/primitives";
import { formatEuro } from "@/lib/config";
import { getDress, myRentalsOut, notifications, rentals } from "@/lib/mock-data";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/account/")({
  component: Overzicht,
});

function Overzicht() {
  const { user, favorites } = useApp();
  const upcoming = rentals.filter((r) => r.status === "aankomend" || r.status === "actief");
  const requests = myRentalsOut.filter((r) => r.status === "aanvraag");
  const unread = notifications.filter((n) => !n.read);

  return (
    <div className="space-y-14">
      <header>
        <h1 className="display text-3xl sm:text-4xl">Hoi {user?.name.split(" ")[0]}</h1>
        <p className="mt-3 text-muted-foreground">Dit staat er voor je klaar.</p>
      </header>

      <section className="grid gap-x-10 gap-y-8 sm:grid-cols-3">
        <Stat label="Actieve huuritems" value={String(upcoming.length)} />
        <Stat label="Nieuwe aanvragen" value={String(requests.length)} />
        <Stat label="Favorieten" value={String(favorites.length)} />
      </section>

      {requests.length > 0 ? (
        <section>
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-lg font-medium">Actie nodig</h2>
            <Link
              to="/account/verhuur"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              Mijn verhuur <ArrowRight className="size-4" />
            </Link>
          </div>
          <ul className="mt-6 space-y-4">
            {requests.map((r) => {
              const dress = getDress(r.dressId);
              return (
                <li key={r.id} className="flex gap-5 border-t border-border pt-5">
                  <img
                    src={dress?.images[0]}
                    alt={dress?.title ?? ""}
                    loading="lazy"
                    className="aspect-[3/4] w-16 shrink-0 object-cover"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{dress?.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{r.nextAction}</p>
                    <p className="price mt-2 text-sm">{formatEuro(r.price)}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <section>
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-lg font-medium">Jouw huuritems</h2>
          <Link
            to="/account/huuritems"
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            Alles bekijken <ArrowRight className="size-4" />
          </Link>
        </div>
        <ul className="mt-6 space-y-4">
          {upcoming.map((r) => {
            const dress = getDress(r.dressId);
            return (
              <li key={r.id} className="flex gap-5 border-t border-border pt-5">
                <img
                  src={dress?.images[0]}
                  alt={dress?.title ?? ""}
                  loading="lazy"
                  className="aspect-[3/4] w-16 shrink-0 object-cover"
                />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-sm font-medium">{dress?.title}</p>
                    <StatusBadge tone={r.status === "actief" ? "success" : "brand"}>
                      {r.status}
                    </StatusBadge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{r.nextAction}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-medium">Recente meldingen</h2>
        <ul className="mt-6 space-y-4">
          {unread.map((n) => (
            <li key={n.id} className="border-t border-border pt-5">
              <p className="text-sm font-medium">{n.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>
              <p className="mt-1 text-xs text-muted-foreground">{n.at}</p>
            </li>
          ))}
        </ul>
      </section>

      <div className="flex flex-wrap gap-4">
        <Button asChild>
          <Link to="/jurken">Ontdek jurken</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/verhuren">Verhuur een jurk</Link>
        </Button>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="hairline pt-5">
      <p className="price text-3xl">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
