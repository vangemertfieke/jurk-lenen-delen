import { createFileRoute } from "@tanstack/react-router";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Rating } from "@/components/dressloop/primitives";
import { reviews } from "@/lib/mock-data";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/account/profiel")({
  component: Profiel,
});

function Profiel() {
  const { user } = useApp();
  const name = user?.name ?? "Jij";

  return (
    <div className="space-y-14">
      <header className="flex flex-wrap items-center gap-6">
        <Avatar className="size-20">
          <AvatarFallback className="text-xl">{name[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <h1 className="display text-3xl">{name}</h1>
          <p className="mt-2 text-sm text-muted-foreground">Amsterdam · lid sinds 2026</p>
          <div className="mt-3">
            <Rating value={5} count={3} />
          </div>
        </div>
      </header>

      <section>
        <h2 className="text-lg font-medium">Over mij</h2>
        <p className="mt-4 max-w-2xl text-[0.9375rem] text-muted-foreground">
          Vul je profiel aan met een korte introductie, zodat huurders en verhuurders weten met
          wie ze te maken hebben. Een compleet profiel wordt vaker geboekt.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-medium">Reviews over jou</h2>
        <ul className="mt-6 space-y-8">
          {reviews.slice(0, 2).map((r) => (
            <li key={r.id} className="hairline pt-6">
              <p className="text-sm font-medium">{r.authorName}</p>
              <p className="text-xs text-muted-foreground">
                {r.date} · afgeronde huur van {r.dressTitle}
              </p>
              <div className="mt-3">
                <Rating value={r.rating} />
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{r.text}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
