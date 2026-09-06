import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { formatEuro, FEES } from "@/lib/config";
import { useApp } from "@/lib/store";
import type { Dress } from "@/lib/types";
import { cn } from "@/lib/utils";

export function DressCard({ dress, showCity = true }: { dress: Dress; showCity?: boolean }) {
  const { isFavorite, toggleFavorite } = useApp();
  const favorite = isFavorite(dress.id);

  return (
    <article className="group relative">
      <div className="relative overflow-hidden rounded-2xl bg-muted">
        <Link to="/jurken/$id" params={{ id: dress.id }} className="block">
          <img
            src={dress.images[0]}
            alt={`${dress.brand} — ${dress.title}`}
            loading="lazy"
            width={900}
            height={1200}
            className="aspect-[3/4] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        </Link>
        <button
          type="button"
          aria-label={favorite ? "Verwijder uit favorieten" : "Bewaar als favoriet"}
          aria-pressed={favorite}
          onClick={() => toggleFavorite(dress.id)}
          className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-card/85 text-foreground backdrop-blur-[2px] transition-colors hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Heart className={cn("size-4", favorite && "fill-primary text-primary")} />
        </button>
      </div>

      <div className="mt-4 space-y-1">
        <p className="text-[0.6875rem] uppercase tracking-[0.16em] text-muted-foreground">
          {dress.brand}
        </p>
        <h3 className="text-[0.9375rem] leading-snug">
          <Link to="/jurken/$id" params={{ id: dress.id }} className="hover:underline">
            {dress.title}
          </Link>
        </h3>
        <p className="text-sm text-muted-foreground">Maat {dress.size}</p>
        <p className="price pt-1 text-sm">
          {formatEuro(dress.basePrice)} / {FEES.baseRentalDays} dagen
        </p>
        {showCity ? <p className="text-xs text-muted-foreground">{dress.city}</p> : null}
      </div>
    </article>
  );
}
