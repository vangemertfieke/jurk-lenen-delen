import { createFileRoute } from "@tanstack/react-router";
import { EmptyState, StatusBadge } from "@/components/dressloop/primitives";
import { notifications } from "@/lib/mock-data";

export const Route = createFileRoute("/account/meldingen")({
  component: Meldingen,
});

function Meldingen() {
  if (notifications.length === 0) {
    return (
      <EmptyState
        title="Nog geen meldingen"
        description="Hier zie je updates over je boekingen, biedingen en berichten."
      />
    );
  }

  return (
    <div className="space-y-10">
      <header>
        <h1 className="display text-3xl sm:text-4xl">Meldingen</h1>
      </header>

      <ul>
        {notifications.map((n) => (
          <li key={n.id} className="border-t border-border py-6">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
              <div className="min-w-0">
                <p className="font-medium">{n.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>
                <p className="mt-2 text-xs text-muted-foreground">{n.at}</p>
              </div>
              {!n.read ? <StatusBadge tone="brand">Nieuw</StatusBadge> : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
