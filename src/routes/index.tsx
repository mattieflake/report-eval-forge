import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { FlaskConical, Activity, ArrowLeft } from "lucide-react";
import { ParameterForm } from "@/components/lab/ParameterForm";
import { ProcessingSkeleton } from "@/components/lab/ProcessingSkeleton";
import { ResultsViewer } from "@/components/lab/ResultsViewer";
import {
  PROCESSING_STEPS,
  runMockEvaluation,
  type EvaluationInput,
  type EvaluationResult,
} from "@/lib/evaluation";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Automated Technical Lab Report & Evaluation Workspace" },
      {
        name: "description",
        content:
          "Submit lab observations and source code, run a structured evaluation, and export executive summaries and metric breakdowns.",
      },
      { property: "og:title", content: "Automated Technical Lab Report & Evaluation Workspace" },
      {
        property: "og:description",
        content:
          "Run deterministic technical evaluations on lab data and code, then review metrics and export Markdown reports.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Workspace,
});

type Phase = { kind: "idle" } | { kind: "running"; step: number } | { kind: "done"; result: EvaluationResult };

const STEP_MS = 650;

function Workspace() {
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });
  const [mobileView, setMobileView] = useState<"input" | "workspace">("input");
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const run = (values: EvaluationInput) => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setPhase({ kind: "running", step: 0 });
    setMobileView("workspace");

    PROCESSING_STEPS.forEach((_, i) => {
      if (i === 0) return;
      timers.current.push(
        window.setTimeout(() => setPhase({ kind: "running", step: i }), i * STEP_MS),
      );
    });
    timers.current.push(
      window.setTimeout(() => {
        const result = runMockEvaluation(values);
        setPhase({ kind: "done", result });
        toast.success("Evaluation complete", {
          description: `${result.verdict} · score ${result.score}/100`,
        });
      }, PROCESSING_STEPS.length * STEP_MS),
    );
  };

  const reset = () => {
    timers.current.forEach(clearTimeout);
    setPhase({ kind: "idle" });
  };

  const isRunning = phase.kind === "running";

  return (
    <div className="grid-bg min-h-screen">
      <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] items-center gap-3 px-4 py-3 sm:px-6">
          <span className="grid size-8 shrink-0 place-items-center rounded-md bg-success/15 text-success">
            <FlaskConical className="size-4" />
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold tracking-tight sm:text-base">
              Automated Technical Lab Report &amp; Evaluation Workspace
            </h1>
            <p className="hidden text-xs text-muted-foreground sm:block">
              Deterministic local analysis · ready for API wiring
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span
              className={cn(
                "hidden items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[11px] sm:inline-flex",
                isRunning ? "border-success/40 text-success" : "text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  isRunning ? "animate-pulse bg-success" : "bg-muted-foreground/50",
                )}
              />
              {isRunning ? "RUNNING" : phase.kind === "done" ? "COMPLETE" : "IDLE"}
            </span>
          </div>
        </div>
        {/* Mobile segmented toggle */}
        <div className="grid grid-cols-2 border-t lg:hidden">
          {(
            [
              ["input", "Parameters"],
              ["workspace", "Workspace"],
            ] as const
          ).map(([v, label]) => (
            <button
              key={v}
              onClick={() => setMobileView(v)}
              className={cn(
                "border-b-2 py-2 text-xs font-medium transition-colors",
                mobileView === v
                  ? "border-success text-foreground"
                  : "border-transparent text-muted-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto grid max-w-[1500px] gap-5 p-4 sm:p-6 lg:h-[calc(100vh-61px)] lg:grid-cols-[420px_minmax(0,1fr)] xl:grid-cols-[460px_minmax(0,1fr)]">
        <section
          className={cn(
            "rounded-xl border bg-card shadow-panel lg:flex lg:min-h-0 lg:flex-col",
            mobileView === "input" ? "block" : "hidden lg:flex",
          )}
        >
          <div className="border-b px-5 py-4">
            <h2 className="text-sm font-semibold">Evaluation Parameters</h2>
            <p className="text-xs text-muted-foreground">
              All fields required. Limits are enforced before a run starts.
            </p>
          </div>
          <div className="p-5 lg:min-h-0 lg:flex-1 lg:overflow-auto">
            <ParameterForm onSubmit={run} onReset={reset} isRunning={isRunning} />
          </div>
        </section>

        <section
          className={cn(
            "min-h-[480px] overflow-hidden rounded-xl border bg-card shadow-panel lg:flex lg:min-h-0 lg:flex-col",
            mobileView === "workspace" ? "block" : "hidden lg:flex",
          )}
        >
          {phase.kind === "idle" && <EmptyState onBack={() => setMobileView("input")} />}
          {phase.kind === "running" && <ProcessingSkeleton step={phase.step} />}
          {phase.kind === "done" && <ResultsViewer key={phase.result.id} result={phase.result} />}
        </section>
      </main>
    </div>
  );
}

function EmptyState({ onBack }: { onBack: () => void }) {
  return (
    <div className="animate-rise flex h-full min-h-[480px] flex-col items-center justify-center p-8 text-center">
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-full bg-success/20 blur-2xl" />
        <div className="relative grid size-16 place-items-center rounded-2xl border bg-surface">
          <Activity className="size-7 text-success" />
        </div>
      </div>
      <h2 className="text-base font-semibold">No evaluation yet</h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Fill in the project parameters, paste your lab observations and code, then run an
        evaluation. Results, metrics and export options will appear here.
      </p>
      <div className="mt-6 grid w-full max-w-sm grid-cols-3 gap-2 text-left">
        {["Summary", "Metrics", "Export"].map((t, i) => (
          <div key={t} className="rounded-md border bg-surface px-3 py-2">
            <div className="font-mono text-[10px] text-muted-foreground">0{i + 1}</div>
            <div className="text-xs font-medium">{t}</div>
          </div>
        ))}
      </div>
      <button
        onClick={onBack}
        className="mt-6 inline-flex items-center gap-1.5 text-xs text-success hover:underline lg:hidden"
      >
        <ArrowLeft className="size-3.5" /> Back to parameters
      </button>
    </div>
  );
}
