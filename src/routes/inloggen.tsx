import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Field } from "@/components/dressloop/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApp } from "@/lib/store";
import { ADMIN_EMAILS } from "@/lib/admin";

export const Route = createFileRoute("/inloggen")({
  head: () => ({
    meta: [
      { title: "Inloggen — Borro" },
      { name: "description", content: "Log in op je Borro-account om te huren en verhuren." },
      { property: "og:title", content: "Inloggen — Borro" },
      { property: "og:description", content: "Welkom terug bij Borro." },
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

      <div className="mt-10 rounded-2xl border border-border p-5">
        <p className="text-sm font-medium">Beheer van Borro</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Alleen voor Senne en Fieke. Je komt direct in het jurkenbeheer.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {ADMIN_EMAILS.map((adminEmail) => (
            <Button
              key={adminEmail}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                signIn({
                  name: adminEmail.split("@")[0] ?? "Beheer",
                  email: adminEmail,
                });
                toast.success("Ingelogd als beheer");
                void navigate({ to: "/beheer/jurken" });
              }}
            >
              Inloggen als {adminEmail.split("@")[0]}
            </Button>
          ))}
        </div>
      </div>
    </AuthLayout>
  );
}
