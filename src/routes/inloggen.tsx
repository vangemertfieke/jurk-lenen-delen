import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Field } from "@/components/dressloop/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/inloggen")({
  head: () => ({
    meta: [
      { title: "Inloggen — DressLoop" },
      { name: "description", content: "Log in op je DressLoop-account om te huren en verhuren." },
      { property: "og:title", content: "Inloggen — DressLoop" },
      { property: "og:description", content: "Welkom terug bij DressLoop." },
    ],
  }),
  component: Inloggen,
});

function Inloggen() {
  const { signIn } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Vul je e-mailadres en wachtwoord in.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      signIn({ name: email.split("@")[0] ?? "Jij", email });
      setLoading(false);
      toast.success("Welkom terug");
      void navigate({ to: "/account" });
    }, 700);
  };

  return (
    <AuthLayout
      title="Welkom terug"
      intro="Log in om je huuritems, verhuur en berichten te bekijken."
      footer={
        <>
          Nog geen account?{" "}
          <Link to="/aanmelden" className="text-primary hover:underline">
            Aanmelden
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-6">
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
        <Field label="Wachtwoord" htmlFor="wachtwoord">
          <Input
            id="wachtwoord"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12"
          />
        </Field>
        <Button type="submit" size="lg" className="w-full" loading={loading}>
          Inloggen
        </Button>
        <Link
          to="/wachtwoord-vergeten"
          className="block text-sm text-muted-foreground hover:text-primary"
        >
          Wachtwoord vergeten?
        </Link>
      </form>
    </AuthLayout>
  );
}
