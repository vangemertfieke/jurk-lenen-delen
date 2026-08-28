import { Star } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  intro,
  action,
  className,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid gap-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end",
        className,
      )}
    >
      <div className="min-w-0 max-w-2xl">
        {eyebrow ? <p className="eyebrow mb-4">{eyebrow}</p> : null}
        <h2 className="display text-3xl sm:text-4xl lg:text-[2.75rem]">{title}</h2>
        {intro ? <p className="mt-4 text-muted-foreground">{intro}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function Rating({
  value,
  count,
  className,
}: {
  value: number;
  count?: number;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-sm", className)}>
      <span className="flex" aria-hidden>
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={cn(
              "size-3.5",
              i <= Math.round(value)
                ? "fill-primary text-primary"
                : "text-border-strong",
            )}
          />
        ))}
      </span>
      <span className="price">{value.toLocaleString("nl-NL", { minimumFractionDigits: 1 })}</span>
      {count !== undefined ? (
        <span className="text-muted-foreground">({count})</span>
      ) : null}
    </span>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="border border-border bg-card px-6 py-16 text-center">
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">{description}</p>
      {action ? <div className="mt-8 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function StatusBadge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "brand" | "success" | "warning";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm px-2.5 py-1 text-[0.6875rem] font-medium uppercase tracking-[0.12em]",
        tone === "neutral" && "bg-muted text-muted-foreground",
        tone === "brand" && "bg-secondary text-secondary-foreground",
        tone === "success" && "bg-success/10 text-success",
        tone === "warning" && "bg-rose/25 text-blush-foreground",
      )}
    >
      {children}
    </span>
  );
}

export function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid grid-cols-[minmax(0,9rem)_minmax(0,1fr)] gap-4 border-b border-border py-3 text-sm last:border-b-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0">{value}</dd>
    </div>
  );
}

export function Field({
  label,
  hint,
  children,
  htmlFor,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  htmlFor?: string;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="block text-sm font-medium">
        {label}
      </label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
