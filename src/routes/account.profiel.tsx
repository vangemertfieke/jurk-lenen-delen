import { createFileRoute } from "@tanstack/react-router";
import { useRef, type ChangeEvent } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Rating } from "@/components/dressloop/primitives";
import { reviews } from "@/lib/mock-data";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/account/profiel")({
  component: Profiel,
});

const MAX_BYTES = 5 * 1024 * 1024;

function Profiel() {
  const { user, setAvatar } = useApp();
  const name = user?.name ?? "Jij";
  const fileRef = useRef<HTMLInputElement>(null);

  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Kies een afbeelding (jpg of png).");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("De foto mag maximaal 5 MB zijn.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setAvatar(String(reader.result));
      toast.success("Profielfoto bijgewerkt.");
    };
    reader.onerror = () => toast.error("Uploaden is niet gelukt. Probeer het opnieuw.");
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-14">
      <header className="flex flex-wrap items-center gap-6">
        <Avatar className="size-20">
          {user?.avatar ? <AvatarImage src={user.avatar} alt={`Profielfoto van ${name}`} /> : null}
          <AvatarFallback className="text-xl">{name[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <h1 className="display text-3xl">{name}</h1>
          <p className="mt-2 text-sm text-muted-foreground">Amsterdam · lid sinds 2026</p>
          <div className="mt-3">
            <Rating value={5} count={3} />
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={onFile}
            />
            <Button size="sm" onClick={() => fileRef.current?.click()}>
              {user?.avatar ? "Foto wijzigen" : "Profielfoto uploaden"}
            </Button>
            {user?.avatar ? (
              <Button
                variant="quiet"
                size="sm"
                onClick={() => {
                  setAvatar(null);
                  toast.success("Profielfoto verwijderd.");
                }}
              >
                Verwijderen
              </Button>
            ) : null}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">JPG of PNG, maximaal 5 MB.</p>
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
