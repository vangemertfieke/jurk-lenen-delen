import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/dressloop/primitives";
import { formatEuro } from "@/lib/config";

export function OfferDialog({
  normalPrice,
  period,
  trigger,
}: {
  normalPrice: number;
  period: string;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(String(Math.round(normalPrice * 0.9)));

  const submit = () => {
    const value = Number(amount.replace(",", "."));
    if (!value || value <= 0) {
      toast.error("Vul een geldig bedrag in.");
      return;
    }
    setOpen(false);
    toast.success("Je bod is verstuurd", {
      description: `Je bod van ${formatEuro(value)} is naar de verhuurder gestuurd.`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Doe een bod</DialogTitle>
          <DialogDescription>
            De verhuurder kan je bod accepteren, weigeren of een tegenbod doen.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          <div className="flex items-baseline justify-between border-b border-border pb-3 text-sm">
            <span className="text-muted-foreground">Normale huurprijs</span>
            <span className="price">{formatEuro(normalPrice)}</span>
          </div>

          <Field label="Jouw bod" htmlFor="bod">
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                €
              </span>
              <Input
                id="bod"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="h-12 pl-9"
              />
            </div>
          </Field>

          <div className="flex items-baseline justify-between text-sm">
            <span className="text-muted-foreground">Huurperiode</span>
            <span>{period}</span>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={submit} className="w-full">
            Verstuur bod
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
