import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Field } from "@/components/dressloop/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/aanmelden")({
  head: () => ({
    meta: [
      { title: "Aanmelden — DressLoop" },
      {
        name: "description",
        content:
          "Maak gratis een DressLoop-account aan. Met één account huur je jurken én verhuur je je eigen kast.",
      },
      { property: "og:title", content: "Aanmelden — DressLoop" },
      { property: "og:description", content: "Eén account om te huren en te verhuren." },
    ],
  }),
  component: Aanmelden,
});

function Aanmelden() {
  const { signIn } = useApp();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!name || !email || password.length < 8) {
      toast.error("Vul je naam, e-mailadres en een wachtwoord van minimaal 8 tekens in.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      signIn({ name, email });
      setLoading(false);
      toast.success("Je account is aangemaakt");
      void navigate({ to: "/account" });
    }, 700);
  };

  return (
    <AuthLayout
      title="Word lid van DressLoop"
      intro="Met één account huur je jurken én verhuur je je eigen kast. De rest van je profiel vul je later aan."
      footer={
        <>
          Heb je al een account?{" "}
          <Link to="/inloggen" className="text-primary hover:underline">
            Inloggen
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-6">
        <Field label="Naam" htmlFor="naam">
          <Input
            id="naam"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-12"
          />
        </Field>
        <Field label="E-mailadres" htmlFor="email">
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12"
          />
        </Field>
        <Field label="Wachtwoord" htmlFor="wachtwoord" hint="Minimaal 8 tekens.">
          <Input
            id="wachtwoord"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12"
          />
        </Field>
        <Button type="submit" size="lg" className="w-full" loading={loading}>
          Aanmelden
        </Button>
      </form>
    </AuthLayout>
  );
}
