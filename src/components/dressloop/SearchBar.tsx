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

export function SearchBar({ className }: { className?: string }) {
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

  return (
    <form
      onSubmit={submit}
      role="search"
      className={cn(
        "grid gap-3 border border-border bg-card p-2 sm:grid-cols-[13rem_minmax(0,1fr)_auto] sm:items-center sm:gap-0",
        className,
      )}
    >
      <Select value={category} onValueChange={setCategory}>
        <SelectTrigger
          aria-label="Categorie"
          className="h-12 w-full rounded-none border-0 border-border bg-transparent px-4 text-sm shadow-none focus-visible:ring-0 sm:border-r"
        >
          <SelectValue placeholder="Categorieën" />
        </SelectTrigger>
        <SelectContent className="rounded-none border-border">
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
        className="h-12 bg-primary px-8 text-sm font-medium tracking-[0.02em] text-primary-foreground transition-opacity hover:opacity-90"
      >
        Zoeken
      </button>
    </form>
  );
}
