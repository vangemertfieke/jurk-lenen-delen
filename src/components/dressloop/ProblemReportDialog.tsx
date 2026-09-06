import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/dressloop/primitives";
import { problemReasonLabel } from "@/lib/rental/labels";
import { useRentals } from "@/lib/rental/store";
import type { ProblemReason } from "@/lib/rental/types";
import { cn } from "@/lib/utils";

const reasonsFor = (role: "owner" | "renter"): ProblemReason[] =>
  role === "owner"
    ? ["stain", "damage", "missing_part", "not_returned", "late_return", "package_lost", "other"]
    : ["damage", "not_as_described", "wrong_dress", "not_received", "package_lost", "other"];

export function ProblemReportDialog({
  rentalId,
  role,
  trigger,
  defaultReason,
}: {
  rentalId: string;
  role: "owner" | "renter";
  trigger?: React.ReactNode;
  defaultReason?: ProblemReason;
}) {
  const { reportProblem } = useRentals();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ProblemReason>(defaultReason ?? "damage");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const submit = () => {
    if (description.trim().length < 20) {
      toast.error("Beschrijf kort en concreet wat er aan de hand is (min. 20 tekens).");
      return;
    }
    reportProblem({
      rentalId,
      role,
      reason,
      description: description.trim(),
      requestedAmount: role === "owner" && amount ? Number(amount) : null,
      images,
    });
    setOpen(false);
    toast.success("Melding ontvangen. Borro bekijkt wat er is gebeurd.");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm">
            Probleem melden
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="display text-2xl">Probleem melden</DialogTitle>
          <DialogDescription>
            Normale gebruikssporen gelden niet als schade. Meld alleen iets dat echt afwijkt, en
            voeg duidelijke foto's toe.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Field label="Wat is er aan de hand?">
            <div className="flex flex-wrap gap-2">
              {reasonsFor(role).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReason(r)}
                  className={cn(
                    "rounded-sm border px-3 py-1.5 text-sm transition-colors",
                    reason === r
                      ? "border-primary bg-secondary text-secondary-foreground"
                      : "border-border hover:border-border-strong",
                  )}
                >
                  {problemReasonLabel[r]}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Omschrijving" hint="Beschrijf wat je ziet, waar en wanneer je het merkte.">
            <Textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Bijvoorbeeld: klein scheurtje van 3 cm in de zoom links, gezien bij het uitpakken."
            />
          </Field>

          <Field label="Foto's" hint="Foto's blijven bij deze huur en worden niet openbaar getoond.">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = e.target.files;
                if (!files?.length) return;
                setImages((p) => [...p, ...Array.from(files).map((f) => URL.createObjectURL(f))]);
              }}
            />
            <div className="flex flex-wrap items-center gap-3">
              <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                Foto's toevoegen
              </Button>
              <span className="text-xs text-muted-foreground">{images.length} toegevoegd</span>
            </div>
          </Field>

          {role === "owner" ? (
            <Field
              label="Gewenste vergoeding (optioneel)"
              hint="Een verzoek, geen toekenning. Borro beoordeelt het samen met beide partijen."
            >
              <Input
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0,00"
              />
            </Field>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <Button onClick={submit}>Melding versturen</Button>
            <Button variant="quiet" onClick={() => setOpen(false)}>
              Annuleren
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
