import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const STORAGE_KEY = "borro.newsletter-signups";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const value = email.trim().toLowerCase();

    if (!isValidEmail(value)) {
      setStatus("error");
      setMessage("Vul een geldig e-mailadres in.");
      return;
    }

    try {
      const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as string[];
      if (existing.includes(value)) {
        setStatus("success");
        setMessage("Je bent al aangemeld.");
        setEmail("");
        return;
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify([...existing, value]));
      setStatus("success");
      setMessage("Je bent aangemeld voor de nieuwsbrief.");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Er ging iets mis. Probeer het later opnieuw.");
    }
  };

  return (
    <section className="container-page py-14 lg:py-20">
      <div className="mx-auto max-w-5xl rounded-3xl border border-border bg-card p-8 md:p-12 lg:p-16">
        <div className="flex flex-col items-start justify-between gap-10 md:flex-row md:items-center md:gap-16">
          <div className="max-w-md">
            <h2 className="display text-2xl text-foreground md:text-3xl">
              Blijf in de loop
            </h2>
            <p className="mt-4 text-muted-foreground">
              Ontvang wekelijks de nieuwste fashion drops en exclusieve styling tips van de Borro
              community.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="w-full max-w-sm flex flex-col gap-3"
          >
            <Input
              type="email"
              placeholder="Je e-mailadres"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 w-full rounded-full border-input bg-background px-5 text-foreground placeholder:text-muted-foreground focus-visible:ring-ring"
            />
            <Button type="submit" size="lg" className="h-12 w-full rounded-full">
              Schrijf je in
            </Button>
            {message && (
              <p
                className={`text-sm ${
                  status === "error" ? "text-rose" : "text-success"
                }`}
              >
                {message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Door je in te schrijven ga je akkoord met onze privacyvoorwaarden.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
