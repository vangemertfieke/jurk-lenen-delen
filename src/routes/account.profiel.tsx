import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Rating } from "@/components/dressloop/primitives";
import { reviews } from "@/lib/mock-data";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/account/profiel")({
  component: Profiel,
});

const MAX_BYTES = 5 * 1024 * 1024;

function Profiel() {
  const { user, setAvatar, updateProfile } = useApp();
  const name = user?.name ?? "Jij";
  const fileRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(user?.name ?? "");
  const [draftCity, setDraftCity] = useState(user?.city ?? "");
  const [draftBio, setDraftBio] = useState(user?.bio ?? "");

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

  const startEditing = () => {
    setDraftName(user?.name ?? "");
    setDraftCity(user?.city ?? "");
    setDraftBio(user?.bio ?? "");
    setEditing(true);
  };

  const onSave = (e: FormEvent) => {
    e.preventDefault();
    const trimmedName = draftName.trim();
    if (trimmedName.length < 2) {
      toast.error("Vul je naam in.");
      return;
    }
    updateProfile({
      name: trimmedName,
      city: draftCity.trim() || undefined,
      bio: draftBio.trim() || undefined,
    });
    setEditing(false);
    toast.success("Je gegevens zijn opgeslagen.");
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
          <p className="mt-2 text-sm text-muted-foreground">
            {user?.city ? `${user.city} · ` : ""}lid sinds 2026
          </p>
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
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-lg font-medium">Over mij</h2>
          {!editing ? (
            <Button variant="outline" size="sm" onClick={startEditing}>
              Gegevens aanpassen
            </Button>
          ) : null}
        </div>

        {editing ? (
          <form onSubmit={onSave} className="mt-6 max-w-xl space-y-5">
            <div className="space-y-2">
              <Label htmlFor="profiel-naam">Naam</Label>
              <Input
                id="profiel-naam"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                maxLength={60}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profiel-woonplaats">Waar kom je vandaan?</Label>
              <Input
                id="profiel-woonplaats"
                value={draftCity}
                onChange={(e) => setDraftCity(e.target.value)}
                placeholder="Bijv. Amsterdam"
                maxLength={60}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profiel-bio">Korte introductie</Label>
              <Textarea
                id="profiel-bio"
                value={draftBio}
                onChange={(e) => setDraftBio(e.target.value)}
                placeholder="Vertel kort wie je bent en wat voor jurken je mooi vindt."
                rows={4}
                maxLength={300}
              />
              <p className="text-xs text-muted-foreground">
                Zichtbaar voor huurders en verhuurders. Maximaal 300 tekens.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button type="submit">Opslaan</Button>
              <Button type="button" variant="quiet" onClick={() => setEditing(false)}>
                Annuleren
              </Button>
            </div>
          </form>
        ) : (
          <div className="mt-4 max-w-2xl">
            {user?.bio ? (
              <p className="text-[0.9375rem] text-muted-foreground">{user.bio}</p>
            ) : (
              <p className="text-[0.9375rem] text-muted-foreground">
                Vul je profiel aan met je woonplaats en een korte introductie, zodat huurders
                en verhuurders weten met wie ze te maken hebben. Een compleet profiel wordt
                vaker geboekt.
              </p>
            )}
          </div>
        )}
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
