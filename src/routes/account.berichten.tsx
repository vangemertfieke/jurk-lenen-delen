import { createFileRoute, Link } from "@tanstack/react-router";
import { Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/dressloop/primitives";
import { formatDateNL, formatEuro } from "@/lib/config";
import { conversations, getDress, getProfile } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/account/berichten")({
  component: Berichten,
});

function Berichten() {
  const [activeId, setActiveId] = useState(conversations[0]?.id ?? "");
  const [draft, setDraft] = useState("");
  const active = conversations.find((c) => c.id === activeId);
  const dress = active ? getDress(active.dressId) : undefined;
  const other = active ? getProfile(active.withProfileId) : undefined;

  if (conversations.length === 0) {
    return (
      <EmptyState
        title="Nog geen berichten"
        description="Wanneer je contact opneemt over een jurk verschijnen je gesprekken hier."
      />
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="display text-3xl sm:text-4xl">Berichten</h1>
      </header>

      <div className="grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-12">
        <aside className="min-w-0">
          <ul className="border-t border-border">
            {conversations.map((c) => {
              const d = getDress(c.dressId);
              const p = getProfile(c.withProfileId);
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => setActiveId(c.id)}
                    className={cn(
                      "flex w-full items-center gap-3 border-b border-border px-1 py-4 text-left",
                      c.id === activeId && "bg-blush/60",
                    )}
                  >
                    <img
                      src={d?.images[0]}
                      alt=""
                      loading="lazy"
                      className="aspect-[3/4] w-10 shrink-0 object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{p.firstName}</p>
                      <p className="truncate text-xs text-muted-foreground">{d?.title}</p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        {active && dress && other ? (
          <section className="min-w-0 border border-border bg-card">
            <header className="flex items-center gap-4 border-b border-border p-5">
              <img
                src={dress.images[0]}
                alt={dress.title}
                loading="lazy"
                className="aspect-[3/4] w-12 shrink-0 object-cover"
              />
              <div className="min-w-0">
                <Link
                  to="/jurken/$id"
                  params={{ id: dress.id }}
                  className="truncate text-sm font-medium hover:underline"
                >
                  {dress.title}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {formatDateNL(new Date(active.from))} — {formatDateNL(new Date(active.to))} ·{" "}
                  {formatEuro(active.price)}
                </p>
              </div>
            </header>

            <ul className="space-y-5 p-5">
              {active.messages.map((m) =>
                m.authorId === "system" ? (
                  <li key={m.id} className="mx-auto max-w-sm bg-blush px-4 py-3 text-center">
                    <p className="text-sm text-blush-foreground">{m.text}</p>
                    <Button size="sm" className="mt-3" onClick={() => toast("Boeking afronden")}>
                      Boeking afronden
                    </Button>
                  </li>
                ) : (
                  <li
                    key={m.id}
                    className={cn("flex gap-3", m.authorId === "me" && "flex-row-reverse")}
                  >
                    <Avatar className="size-8 shrink-0">
                      <AvatarFallback>
                        {m.authorId === "me" ? "J" : other.firstName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={cn(
                        "max-w-[75%] px-4 py-3 text-sm",
                        m.authorId === "me"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground",
                      )}
                    >
                      <p>{m.text}</p>
                      <p
                        className={cn(
                          "mt-1 text-[0.6875rem]",
                          m.authorId === "me"
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground",
                        )}
                      >
                        {m.at}
                      </p>
                    </div>
                  </li>
                ),
              )}
            </ul>

            <form
              className="flex items-center gap-3 border-t border-border p-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (!draft.trim()) return;
                setDraft("");
                toast.success("Bericht verstuurd");
              }}
            >
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Schrijf een bericht"
                aria-label="Bericht"
                className="h-11"
              />
              <Button type="submit" size="icon" aria-label="Versturen">
                <Send />
              </Button>
            </form>
          </section>
        ) : null}
      </div>
    </div>
  );
}
