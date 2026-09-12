import { createFileRoute, Link } from "@tanstack/react-router";
import { Send, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/dressloop/primitives";
import { formatDateNL, formatEuro } from "@/lib/config";
import { conversations, getDress, getProfile } from "@/lib/mock-data";
import { validateChatMessage } from "@/lib/chat-moderation";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/account/berichten")({
  component: Berichten,
});

export function Berichten() {
  const [activeId, setActiveId] = useState(conversations[0]?.id ?? "");
  const [draft, setDraft] = useState("");
  const [convs, setConvs] = useState(conversations);
  const [tab, setTab] = useState<"alles" | "huur" | "verhuur">("alles");

  const roleOf = (c: (typeof convs)[number]) => c.role ?? "huur";
  const visibleConvs = convs.filter((c) => tab === "alles" || roleOf(c) === tab);
  const counts = {
    alles: convs.length,
    huur: convs.filter((c) => roleOf(c) === "huur").length,
    verhuur: convs.filter((c) => roleOf(c) === "verhuur").length,
  };

  const active = convs.find((c) => c.id === activeId);
  const dress = active ? getDress(active.dressId) : undefined;
  const other = active ? getProfile(active.withProfileId) : undefined;

  const validation = validateChatMessage(draft);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;

    const check = validateChatMessage(draft);
    if (!check.allowed) {
      toast.error("Bericht geblokkeerd", {
        description: check.reason,
        duration: 5000,
      });
      return;
    }

    const newMessage = {
      id: `m_${Date.now()}`,
      authorId: "me",
      text: check.sanitizedText,
      at: "Zojuist",
    };

    setConvs((prev) =>
      prev.map((c) =>
        c.id === activeId
          ? {
              ...c,
              messages: [...c.messages, newMessage],
            }
          : c,
      ),
    );

    setDraft("");
    toast.success("Bericht verstuurd");
  };

  if (convs.length === 0) {
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
        <div className="mt-5 flex flex-wrap gap-2">
          {(
            [
              { key: "alles", label: "Alles" },
              { key: "huur", label: "Ik huur" },
              { key: "verhuur", label: "Ik verhuur" },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => {
                setTab(t.key);
                const first = convs.find(
                  (c) => t.key === "alles" || (c.role ?? "huur") === t.key,
                );
                if (first) setActiveId(first.id);
              }}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm transition-colors",
                tab === t.key
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label} ({counts[t.key]})
            </button>
          ))}
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-12">
        <aside className="min-w-0">
          <ul className="border-t border-border">
            {visibleConvs.map((c) => {
              const d = getDress(c.dressId);
              const p = getProfile(c.withProfileId);
              const isVerhuur = roleOf(c) === "verhuur";
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => setActiveId(c.id)}
                    className={cn(
                      "flex w-full items-center gap-3 border-b border-border px-1 py-4 text-left transition-colors hover:bg-muted/50",
                      c.id === activeId && "bg-blush/60 font-medium",
                    )}
                  >
                    <img
                      src={d?.images[0]}
                      alt=""
                      loading="lazy"
                      className="aspect-[3/4] w-10 shrink-0 rounded-lg object-cover"
                    />
                    <div className="min-w-0">
                      <span
                        className={cn(
                          "inline-block rounded-full px-2 py-0.5 text-[0.625rem] font-semibold uppercase tracking-wide",
                          isVerhuur
                            ? "bg-primary text-primary-foreground"
                            : "bg-blush text-blush-foreground",
                        )}
                      >
                        {isVerhuur ? "Ik verhuur" : "Ik huur"}
                      </span>
                      <p className="mt-1 truncate text-sm font-medium">{p.firstName}</p>
                      <p className="truncate text-xs text-muted-foreground">{d?.title}</p>
                    </div>
                  </button>
                </li>
              );
            })}
            {visibleConvs.length === 0 ? (
              <li className="border-b border-border py-6 text-sm text-muted-foreground">
                Nog geen gesprekken hier.
              </li>
            ) : null}
          </ul>
        </aside>

        {active && dress && other ? (
          <section className="flex min-w-0 flex-col border border-border bg-card">
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

            <ul className="flex-1 space-y-5 p-5 max-h-[26rem] overflow-y-auto">
              {active.messages.map((m) =>
                m.authorId === "system" ? (
                  <li key={m.id} className="mx-auto max-w-sm bg-blush px-4 py-3 text-center">
                    <p className="text-sm text-blush-foreground">{m.text}</p>
                    <Button size="sm" className="mt-3" onClick={() => toast.info("Boeking afronden")}>
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
                      <p className="whitespace-pre-wrap break-words">{m.text}</p>
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

            {/* Form */}
            <div className="border-t border-border p-4">
              <form className="flex items-center gap-3" onSubmit={handleSend}>
                <Input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Schrijf een bericht..."
                  aria-label="Bericht"
                  className="h-11"
                />
                <Button type="submit" size="icon" aria-label="Versturen" disabled={!draft.trim()}>
                  <Send />
                </Button>
              </form>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
