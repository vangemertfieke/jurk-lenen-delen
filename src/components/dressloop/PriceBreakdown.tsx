import { calculatePriceBreakdown, formatEuro, type DeliveryMethod } from "@/lib/config";

export function PriceBreakdown({
  basePrice,
  days,
  delivery,
  deposit = 0,
  agreedPrice,
}: {
  basePrice: number;
  days: number;
  delivery: DeliveryMethod;
  deposit?: number;
  agreedPrice?: number;
}) {
  const b = calculatePriceBreakdown({ basePrice, days, delivery, deposit, agreedPrice });

  return (
    <div className="space-y-4">
      <dl className="space-y-3 text-sm">
        <Row label={`Huurprijs (${days} dagen)`} value={formatEuro(b.rental)} />
        <Row label="Servicekosten" value={formatEuro(b.serviceFee)} />
        {b.shipping > 0 ? <Row label="Verzending" value={formatEuro(b.shipping)} /> : null}
        {b.deposit > 0 ? <Row label="Borg" value={formatEuro(b.deposit)} /> : null}
      </dl>
      <div className="hairline pt-4">
        <div className="flex items-baseline justify-between">
          <span className="font-medium">Totaal</span>
          <span className="price text-lg">{formatEuro(b.total)}</span>
        </div>
      </div>
      {b.deposit > 0 ? (
        <p className="bg-blush px-4 py-3 text-xs leading-relaxed text-blush-foreground">
          Borg {formatEuro(b.deposit)} — je krijgt dit bedrag terug wanneer de jurk goed is
          geretourneerd.
        </p>
      ) : null}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="price">{value}</dd>
    </div>
  );
}
