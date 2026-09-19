import { useState } from "react";
import { toast } from "sonner";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  FileJson,
  FileText,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Markdown } from "./Markdown";
import type { EvaluationResult, MetricStatus } from "@/lib/evaluation";
import { cn } from "@/lib/utils";

const STATUS: Record<
  MetricStatus,
  { label: string; icon: typeof CheckCircle2; className: string; row: string }
> = {
  pass: {
    label: "Pass",
    icon: CheckCircle2,
    className: "bg-success/15 text-success border-success/30",
    row: "",
  },
  warn: {
    label: "Warn",
    icon: AlertTriangle,
    className: "bg-warning/15 text-warning border-warning/30",
    row: "bg-warning/[0.03]",
  },
  fail: {
    label: "Fail",
    icon: XCircle,
    className: "bg-danger/15 text-danger border-danger/30",
    row: "bg-danger/[0.04]",
  },
};

function StatusBadge({ status }: { status: MetricStatus }) {
  const s = STATUS[status];
  const Icon = s.icon;
  return (
    <Badge variant="outline" className={cn("gap-1 font-medium", s.className)}>
      <Icon className="size-3" />
      {s.label}
    </Badge>
  );
}

function slug(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function download(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ResultsViewer({ result }: { result: EvaluationResult }) {
  const [tab, setTab] = useState("summary");
  const counts = result.metrics.reduce(
    (acc, m) => ({ ...acc, [m.status]: acc[m.status] + 1 }),
    { pass: 0, warn: 0, fail: 0 } as Record<MetricStatus, number>,
  );
  const verdictTone =
    result.verdict === "Approved" ? "success" : result.verdict === "Conditional" ? "warn" : "fail";
  const base = slug(result.input.title) || "evaluation";

  const copyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(result.markdown);
      toast.success("Markdown copied", { description: `${result.markdown.length} characters.` });
    } catch {
      toast.error("Copy failed", { description: "Clipboard access was blocked by the browser." });
    }
  };

  return (
    <div className="animate-rise flex h-full flex-col">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 border-b px-6 py-5">
        <div className="min-w-0">
          <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            Evaluation #{result.id} · {result.input.platform}
          </p>
          <h2 className="mt-1 truncate text-lg font-semibold tracking-tight">
            {result.input.title}
          </h2>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1 text-success">
              <CheckCircle2 className="size-3.5" /> {counts.pass} passed
            </span>
            <span className="inline-flex items-center gap-1 text-warning">
              <AlertTriangle className="size-3.5" /> {counts.warn} flagged
            </span>
            <span className="inline-flex items-center gap-1 text-danger">
              <XCircle className="size-3.5" /> {counts.fail} failed
            </span>
          </div>
        </div>
        <div
          className={cn(
            "shrink-0 rounded-lg border px-3 py-2 text-right",
            verdictTone === "success" && "border-success/30 bg-success/10",
            verdictTone === "warn" && "border-warning/30 bg-warning/10",
            verdictTone === "fail" && "border-danger/30 bg-danger/10",
          )}
        >
          <div className="font-mono text-2xl font-semibold leading-none tabular-nums">
            {result.score}
            <span className="text-xs text-muted-foreground">/100</span>
          </div>
          <div
            className={cn(
              "mt-1 text-[11px] font-medium uppercase tracking-wider",
              verdictTone === "success" && "text-success",
              verdictTone === "warn" && "text-warning",
              verdictTone === "fail" && "text-danger",
            )}
          >
            {result.verdict} · {result.grade}
          </div>
        </div>
      </header>

      <Tabs value={tab} onValueChange={setTab} className="flex min-h-0 flex-1 flex-col">
        <div className="border-b px-6">
          <TabsList className="h-11 w-full justify-start gap-1 rounded-none bg-transparent p-0 sm:w-auto">
            {(
              [
                ["summary", "Executive Summary"],
                ["metrics", "Metrics Breakdown"],
                ["export", "Export"],
              ] as const
            ).map(([v, label]) => (
              <TabsTrigger
                key={v}
                value={v}
                className="h-11 flex-1 rounded-none border-b-2 border-transparent px-3 text-muted-foreground shadow-none data-[state=active]:border-success data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none sm:flex-none"
              >
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="summary" className="mt-0 flex-1 overflow-auto p-6">
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["Lines analyzed", result.stats.lines],
              ["Callable units", result.stats.functions],
              ["Observations", result.stats.observations],
              ["Numeric samples", result.stats.numericSamples],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border bg-surface p-3">
                <div className="font-mono text-xl font-semibold tabular-nums">{value}</div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  {label}
                </div>
              </div>
            ))}
          </div>
          <Markdown source={result.markdown} />
        </TabsContent>

        <TabsContent value="metrics" className="mt-0 flex-1 overflow-auto p-0">
          <Table>
            <TableHeader className="sticky top-0 bg-card">
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-6">Metric</TableHead>
                <TableHead className="hidden md:table-cell">Category</TableHead>
                <TableHead className="text-right">Threshold</TableHead>
                <TableHead className="text-right">Observed</TableHead>
                <TableHead className="pr-6 text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.metrics.map((m) => (
                <TableRow key={m.id} className={STATUS[m.status].row}>
                  <TableCell className="pl-6">
                    <div className="font-medium">{m.name}</div>
                    <div className="text-xs text-muted-foreground">{m.note}</div>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">
                    {m.category}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-muted-foreground">
                    {m.threshold}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-mono text-xs font-medium",
                      m.status === "fail" && "text-danger",
                      m.status === "warn" && "text-warning",
                    )}
                  >
                    {m.observed}
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <StatusBadge status={m.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="export" className="mt-0 flex-1 overflow-auto p-6">
          <div className="grid gap-3 sm:grid-cols-3">
            <button
              onClick={copyMarkdown}
              className="group rounded-lg border bg-surface p-4 text-left transition-colors hover:border-success/40 hover:bg-success/5"
            >
              <Copy className="mb-3 size-5 text-success" />
              <div className="font-medium">Copy Markdown</div>
              <div className="mt-1 text-xs text-muted-foreground">
                Raw report to clipboard for wikis or PR descriptions.
              </div>
            </button>
            <button
              onClick={() => {
                download(`${base}-report.md`, result.markdown, "text/markdown");
                toast.success("Report exported", { description: `${base}-report.md` });
              }}
              className="group rounded-lg border bg-surface p-4 text-left transition-colors hover:border-success/40 hover:bg-success/5"
            >
              <FileText className="mb-3 size-5 text-success" />
              <div className="font-medium">Download .md</div>
              <div className="mt-1 text-xs text-muted-foreground">
                Save the executive summary as a Markdown file.
              </div>
            </button>
            <button
              onClick={() => {
                download(
                  `${base}-evaluation.json`,
                  JSON.stringify(result, null, 2),
                  "application/json",
                );
                toast.success("JSON exported", { description: `${base}-evaluation.json` });
              }}
              className="group rounded-lg border bg-surface p-4 text-left transition-colors hover:border-success/40 hover:bg-success/5"
            >
              <FileJson className="mb-3 size-5 text-success" />
              <div className="font-medium">Download .json</div>
              <div className="mt-1 text-xs text-muted-foreground">
                Structured metrics payload for pipelines.
              </div>
            </button>
          </div>

          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Raw Markdown preview
              </span>
              <Button size="sm" variant="outline" onClick={copyMarkdown}>
                <Copy /> Copy
              </Button>
            </div>
            <pre className="max-h-80 overflow-auto rounded-lg border bg-background p-4 font-mono text-xs leading-relaxed text-muted-foreground">
              {result.markdown}
            </pre>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

