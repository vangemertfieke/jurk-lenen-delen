import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Field } from "@/components/dressloop/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/wachtwoord-vergeten")({
  head: () => ({
    meta: [
      { title: "Wachtwoord vergeten — Borro" },
      { name: "description", content: "Ontvang een link om je Borro-wachtwoord opnieuw in te stellen." },
      { property: "og:title", content: "Wachtwoord vergeten — Borro" },
      { property: "og:description", content: "Stel je wachtwoord opnieuw in." },
    ],
  }),
  component: WachtwoordVergeten,
});

function WachtwoordVergeten() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 600);
  };

  return (
    <AuthLayout
      title="Wachtwoord vergeten"
      intro="Vul je e-mailadres in en we sturen je een link om een nieuw wachtwoord in te stellen."
      footer={
        <Link to="/inloggen" className="text-primary hover:underline">
          Terug naar inloggen
        </Link>
      }
    >
      {sent ? (
        <div className="bg-blush px-5 py-6 text-sm text-blush-foreground">
          <p className="font-medium">Check je e-mail</p>
          <p className="mt-2">
            Als er een account bestaat bij {email}, ontvang je binnen enkele minuten een link.
          </p>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-6">
          <Field label="E-mailadres" htmlFor="email">
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12"
              required
            />
          </Field>
          <Button type="submit" size="lg" className="w-full" loading={loading}>
            Stuur link
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
