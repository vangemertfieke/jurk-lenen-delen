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
    <section className="bg-primary text-primary-foreground">
      <div className="container-page py-16 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-primary-foreground/70">
            Nieuwsbrief
          </p>
          <h2 className="display mt-4 text-2xl sm:text-3xl lg:text-4xl">
            Blijf op de hoogte
          </h2>
          <p className="mt-4 text-primary-foreground/80">
            Ontvang tips, nieuwe jurken en inspiratie voor je volgende feest in je mailbox.
          </p>
          <form
            onSubmit={handleSubmit}
            className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center"
          >
            <Input
              type="email"
              placeholder="Jouw e-mailadres"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 w-full rounded-full border-0 bg-primary-foreground px-5 text-foreground placeholder:text-muted-foreground sm:w-80"
            />
            <Button type="submit" size="lg" variant="secondary" className="rounded-full">
              Aanmelden
            </Button>
          </form>
          {message && (
            <p
              className={`mt-4 text-sm ${
                status === "error" ? "text-rose" : "text-primary-foreground/90"
              }`}
            >
              {message}
            </p>
          )}
          <p className="mt-4 text-xs text-primary-foreground/60">
            We sturen alleen mail die echt relevant is. Je kunt je altijd afmelden.
          </p>
        </div>
      </div>
    </section>
  );
}
