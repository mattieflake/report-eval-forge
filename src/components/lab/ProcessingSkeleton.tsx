import { Check, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { PROCESSING_STEPS } from "@/lib/evaluation";
import { cn } from "@/lib/utils";

export function ProcessingSkeleton({ step }: { step: number }) {
  const pct = Math.round(((step + 0.5) / PROCESSING_STEPS.length) * 100);
  return (
    <div className="animate-rise flex h-full flex-col gap-6 p-6" aria-live="polite" aria-busy>
      <div>
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-medium text-foreground">Evaluation in progress</span>
          <span className="font-mono text-muted-foreground">{pct}%</span>
        </div>
        <Progress value={pct} className="h-1.5 bg-muted [&>div]:bg-success" />
      </div>

      <ol className="space-y-2.5">
        {PROCESSING_STEPS.map((s, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <li
              key={s.id}
              className={cn(
                "flex items-center gap-3 rounded-md border px-3 py-2.5 text-sm transition-colors",
                active && "border-success/40 bg-success/5",
                done && "border-border bg-surface",
                !done && !active && "border-transparent text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "grid size-5 shrink-0 place-items-center rounded-full",
                  done && "bg-success text-success-foreground",
                  active && "animate-pulse-ring text-success",
                  !done && !active && "border border-border",
                )}
              >
                {done ? (
                  <Check className="size-3" strokeWidth={3} />
                ) : active ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : null}
              </span>
              <span className={cn("font-mono text-xs", active && "text-foreground")}>
                {s.label}
              </span>
            </li>
          );
        })}
      </ol>

      <div className="space-y-3 pt-2">
        <Skeleton className="h-7 w-2/3 bg-muted" />
        <Skeleton className="h-4 w-full bg-muted" />
        <Skeleton className="h-4 w-11/12 bg-muted" />
        <Skeleton className="h-4 w-4/5 bg-muted" />
        <div className="grid grid-cols-3 gap-3 pt-3">
          <Skeleton className="h-16 bg-muted" />
          <Skeleton className="h-16 bg-muted" />
          <Skeleton className="h-16 bg-muted" />
        </div>
      </div>
    </div>
  );
}
