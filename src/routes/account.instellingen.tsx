import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Field } from "@/components/dressloop/primitives";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/account/instellingen")({
  component: Instellingen,
});

function Instellingen() {
  const { user, signOut } = useApp();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [city, setCity] = useState("Amsterdam");
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [pushUpdates, setPushUpdates] = useState(false);

  return (
    <div className="max-w-xl space-y-14">
      <header>
        <h1 className="display text-3xl sm:text-4xl">Instellingen</h1>
      </header>

      <section className="space-y-8">
        <h2 className="text-lg font-medium">Persoonlijke gegevens</h2>
        <Field label="Naam" htmlFor="naam">
          <Input id="naam" value={name} onChange={(e) => setName(e.target.value)} className="h-12" />
        </Field>
        <Field label="E-mailadres" htmlFor="email">
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12"
          />
        </Field>
        <Field label="Woonplaats" htmlFor="plaats" hint="Alleen je stad en buurt zijn zichtbaar voor anderen.">
          <Input id="plaats" value={city} onChange={(e) => setCity(e.target.value)} className="h-12" />
        </Field>
        <Button onClick={() => toast.success("Gegevens opgeslagen")}>Opslaan</Button>
      </section>

      <section className="space-y-6">
        <h2 className="text-lg font-medium">Meldingen</h2>
        <Toggle
          label="E-mailupdates"
          description="Berichten, biedingen en boekingsupdates per e-mail."
          checked={emailUpdates}
          onChange={setEmailUpdates}
        />
        <Toggle
          label="Pushmeldingen"
          description="Directe meldingen op je telefoon."
          checked={pushUpdates}
          onChange={setPushUpdates}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Account</h2>
        <Button
          variant="outline"
          onClick={() => {
            signOut();
            toast("Je bent uitgelogd");
            void navigate({ to: "/" });
          }}
        >
          Uitloggen
        </Button>
      </section>
    </div>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-6 border-b border-border pb-5">
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
