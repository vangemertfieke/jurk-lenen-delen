import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { DressCard } from "@/components/dressloop/DressCard";
import { EmptyState } from "@/components/dressloop/primitives";
import { getDresses } from "@/lib/mock-data";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/account/favorieten")({
  component: Favorieten,
});

function Favorieten() {
  const { favorites, hydrated } = useApp();
  const saved = getDresses().filter((d) => favorites.includes(d.id));

  return (
    <div className="space-y-10">
      <header>
        <h1 className="display text-3xl sm:text-4xl">Favorieten</h1>
        <p className="mt-3 text-muted-foreground">De jurken die je hebt bewaard.</p>
      </header>

      {!hydrated ? (
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[3/4] w-full bg-muted" />
              <div className="mt-4 h-3 w-1/2 bg-muted" />
            </div>
          ))}
        </div>
      ) : saved.length === 0 ? (
        <EmptyState
          title="Nog geen favorieten"
          description="Bewaar jurken die je leuk vindt met het hartje."
          action={
            <Button asChild>
              <Link to="/jurken">Ontdek jurken</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-3">
          {saved.map((d) => (
            <DressCard key={d.id} dress={d} />
          ))}
        </div>
      )}
    </div>
  );
}
