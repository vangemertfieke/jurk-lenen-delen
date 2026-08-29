import { Check } from "lucide-react";
import type { TimelineStep } from "@/lib/rental/engine";
import { cn } from "@/lib/utils";

export function RentalTimeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <ol className="space-y-0">
      {steps.map((step, i) => (
        <li key={step.key} className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-4">
          <div className="flex flex-col items-center">
            <span
              className={cn(
                "flex size-5 shrink-0 items-center justify-center rounded-full border text-[0.625rem]",
                step.state === "done" && "border-primary bg-primary text-primary-foreground",
                step.state === "current" && "border-primary bg-background text-primary",
                step.state === "todo" && "border-border-strong bg-background text-transparent",
              )}
              aria-hidden
            >
              {step.state === "done" ? (
                <Check className="size-3" />
              ) : step.state === "current" ? (
                <span className="size-2 rounded-full bg-primary" />
              ) : null}
            </span>
            {i < steps.length - 1 ? (
              <span
                className={cn(
                  "w-px flex-1",
                  step.state === "done" ? "bg-primary/40" : "bg-border",
                )}
              />
            ) : null}
          </div>
          <div className={cn("pb-6", i === steps.length - 1 && "pb-0")}>
            <p
              className={cn(
                "text-sm",
                step.state === "todo" ? "text-muted-foreground" : "font-medium",
                step.state === "current" && "text-primary",
              )}
            >
              {step.label}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
