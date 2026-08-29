import { nl } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { daysBetween, formatDateNL, formatEuro, rentalPriceForDays } from "@/lib/config";

export function DateRangeField({
  range,
  onChange,
  basePrice,
  disabledBefore = new Date(),
}: {
  range: DateRange | undefined;
  onChange: (r: DateRange | undefined) => void;
  basePrice: number;
  disabledBefore?: Date;
}) {
  const days = range?.from && range?.to ? daysBetween(range.from, range.to) : 0;

  return (
    <div className="space-y-5">
      <div className="border border-border bg-card p-2 sm:p-4">
        <Calendar
          mode="range"
          locale={nl}
          selected={range}
          onSelect={onChange}
          numberOfMonths={1}
          disabled={{ before: disabledBefore }}
          className="mx-auto"
        />
      </div>

      {range?.from && range?.to ? (
        <div className="flex flex-wrap items-baseline justify-between gap-2 bg-blush px-4 py-3 text-sm text-blush-foreground">
          <span>
            {formatDateNL(range.from)} — {formatDateNL(range.to)} · {days} dagen
          </span>
          <span className="price">{formatEuro(rentalPriceForDays(basePrice, days))}</span>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Kies een start- en einddatum om de totaalprijs te zien.
        </p>
      )}
    </div>
  );
}
