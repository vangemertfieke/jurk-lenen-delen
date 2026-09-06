import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState, type FormEvent } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { occasions } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const ALLE = "alle";

export function SearchBar({
  className,
  variant = "default",
}: {
  className?: string;
  variant?: "default" | "compact";
}) {
  const navigate = useNavigate();
  const [category, setCategory] = useState(ALLE);
  const [query, setQuery] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    void navigate({
      to: "/jurken",
      search: {
        gelegenheid: category === ALLE ? undefined : category,
        q: query.trim() ? query.trim() : undefined,
      },
    });
  };

  if (variant === "compact") {
    return (
      <form
        onSubmit={submit}
        role="search"
        className={cn(
          "flex h-10 min-w-0 items-center rounded-full border border-border bg-card transition-colors focus-within:border-primary",
          className,
        )}
      >
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger
            aria-label="Categorie"
            className="h-full w-auto shrink-0 gap-1.5 rounded-full border-0 bg-transparent px-4 text-xs shadow-none focus-visible:ring-0 [&_svg]:size-3.5"
          >
            <SelectValue placeholder="Categorieën" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-border">
            <SelectItem value={ALLE}>Categorieën</SelectItem>
            {occasions.map((o) => (
              <SelectItem key={o} value={o}>
                {o}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span aria-hidden className="h-4 w-px shrink-0 bg-border" />

        <label className="flex min-w-0 flex-1 items-center gap-2 pl-3">
          <Search className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="sr-only">Zoek jurken</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Zoek jurken, merken of kleuren"
            className="h-full w-full min-w-0 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
          />
        </label>
      </form>
    );
  }

  return (
    <form
      onSubmit={submit}
      role="search"
      className={cn(
        "grid gap-3 rounded-2xl border border-border bg-card p-2 sm:grid-cols-[13rem_minmax(0,1fr)_auto] sm:items-center sm:gap-0",
        className,
      )}
    >
      <Select value={category} onValueChange={setCategory}>
        <SelectTrigger
          aria-label="Categorie"
          className="h-12 w-full rounded-xl border-0 border-border bg-transparent px-4 text-sm shadow-none focus-visible:ring-0 sm:border-r"
        >
          <SelectValue placeholder="Categorieën" />
        </SelectTrigger>
        <SelectContent className="rounded-xl border-border">
          <SelectItem value={ALLE}>Categorieën</SelectItem>
          {occasions.map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <label className="flex min-w-0 items-center gap-3 px-4">
        <Search className="size-4 shrink-0 text-muted-foreground" />
        <span className="sr-only">Zoek jurken</span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Zoek jurken, merken of kleuren"
          className="h-12 w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </label>

      <button
        type="submit"
        className="h-12 rounded-full bg-primary px-8 text-sm font-medium tracking-[0.02em] text-primary-foreground transition-opacity hover:opacity-90"
      >
        Zoeken
      </button>
    </form>
  );
}
