import { z } from "zod";

export const LIMITS = {
  title: { min: 3, max: 120 },
  platform: { min: 2, max: 80 },
  labData: { min: 20, max: 8000 },
  code: { min: 10, max: 12000 },
} as const;

export const evaluationInputSchema = z.object({
  title: z
    .string()
    .trim()
    .min(LIMITS.title.min, `Project title needs at least ${LIMITS.title.min} characters`)
    .max(LIMITS.title.max, `Project title must be under ${LIMITS.title.max} characters`),
  platform: z
    .string()
    .trim()
    .min(LIMITS.platform.min, "Target platform is required")
    .max(LIMITS.platform.max, `Platform must be under ${LIMITS.platform.max} characters`),
  labData: z
    .string()
    .trim()
    .min(LIMITS.labData.min, `Lab data needs at least ${LIMITS.labData.min} characters`)
    .max(LIMITS.labData.max, `Lab data must be under ${LIMITS.labData.max} characters`),
  code: z
    .string()
    .trim()
    .min(LIMITS.code.min, `Code snippet needs at least ${LIMITS.code.min} characters`)
    .max(LIMITS.code.max, `Code snippet must be under ${LIMITS.code.max} characters`),
});

export type EvaluationInput = z.infer<typeof evaluationInputSchema>;

export type MetricStatus = "pass" | "warn" | "fail";

export interface Metric {
  id: string;
  name: string;
  category: string;
  threshold: string;
  observed: string;
  status: MetricStatus;
  note: string;
}

export interface EvaluationResult {
  id: string;
  generatedAt: string;
  input: EvaluationInput;
  score: number;
  grade: "A" | "B" | "C" | "D";
  verdict: "Approved" | "Conditional" | "Rejected";
  metrics: Metric[];
  markdown: string;
  stats: { lines: number; functions: number; observations: number; numericSamples: number };
}

export const PROCESSING_STEPS = [
  { id: "parse", label: "Parsing syntax..." },
  { id: "observe", label: "Extracting lab observations..." },
  { id: "validate", label: "Validating against criteria..." },
  { id: "compile", label: "Compiling summary..." },
] as const;

/** Deterministic hash so identical inputs produce identical results. */
function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pick(seed: number, i: number, range: number) {
  return (Math.imul(seed ^ (i * 2654435761), 1103515245) >>> 8) % range;
}

export function runMockEvaluation(input: EvaluationInput): EvaluationResult {
  const seed = hash(input.title + input.platform + input.labData + input.code);

  const lines = input.code.split("\n").length;
  const functions = (input.code.match(/\b(function|def|fn|=>|void|public|private)\b/g) ?? [])
    .length;
  const observations = input.labData.split(/\n+/).filter((l) => l.trim()).length;
  const numericSamples = (input.labData.match(/-?\d+(\.\d+)?/g) ?? []).length;

  const complexity = Math.min(28, Math.round(lines / 3) + pick(seed, 1, 6));
  const latency = 40 + pick(seed, 2, 90);
  const coverage = 62 + pick(seed, 3, 36);
  const memory = 96 + pick(seed, 4, 180);
  const errorRate = (pick(seed, 5, 30) / 10).toFixed(1);
  const drift = (pick(seed, 6, 45) / 10).toFixed(1);
  const lint = pick(seed, 7, 9);

  const status = (ok: boolean, warn: boolean): MetricStatus =>
    ok ? "pass" : warn ? "warn" : "fail";

  const metrics: Metric[] = [
    {
      id: "complexity",
      name: "Cyclomatic complexity",
      category: "Code Quality",
      threshold: "≤ 15",
      observed: String(complexity),
      status: status(complexity <= 15, complexity <= 20),
      note: complexity <= 15 ? "Within maintainability budget" : "Consider decomposing branches",
    },
    {
      id: "lint",
      name: "Static analysis findings",
      category: "Code Quality",
      threshold: "0 critical",
      observed: `${lint} warnings`,
      status: status(lint <= 2, lint <= 5),
      note: lint <= 2 ? "Clean lint pass" : "Unused symbols and shadowed vars detected",
    },
    {
      id: "coverage",
      name: "Test coverage",
      category: "Verification",
      threshold: "≥ 80%",
      observed: `${coverage}%`,
      status: status(coverage >= 80, coverage >= 70),
      note: coverage >= 80 ? "Meets coverage gate" : "Edge cases under-tested",
    },
    {
      id: "latency",
      name: "p95 latency",
      category: "Performance",
      threshold: "≤ 100 ms",
      observed: `${latency} ms`,
      status: status(latency <= 100, latency <= 120),
      note: latency <= 100 ? "Latency budget satisfied" : "Hot path exceeds budget",
    },
    {
      id: "memory",
      name: "Peak memory",
      category: "Performance",
      threshold: "≤ 200 MB",
      observed: `${memory} MB`,
      status: status(memory <= 200, memory <= 240),
      note: memory <= 200 ? "Stable allocation profile" : "Possible buffer retention",
    },
    {
      id: "error",
      name: "Observed error rate",
      category: "Lab Data",
      threshold: "≤ 1.0%",
      observed: `${errorRate}%`,
      status: status(Number(errorRate) <= 1, Number(errorRate) <= 2),
      note: Number(errorRate) <= 1 ? "Within tolerance" : "Fault injection exposed failures",
    },
    {
      id: "drift",
      name: "Measurement drift",
      category: "Lab Data",
      threshold: "≤ 2.0%",
      observed: `${drift}%`,
      status: status(Number(drift) <= 2, Number(drift) <= 3),
      note: Number(drift) <= 2 ? "Reproducible across runs" : "Re-calibrate instrumentation",
    },
    {
      id: "samples",
      name: "Numeric samples captured",
      category: "Lab Data",
      threshold: "≥ 5",
      observed: String(numericSamples),
      status: status(numericSamples >= 5, numericSamples >= 2),
      note: numericSamples >= 5 ? "Sufficient data density" : "Add more quantitative readings",
    },
  ];

  const points = metrics.reduce(
    (acc, m) => acc + (m.status === "pass" ? 1 : m.status === "warn" ? 0.5 : 0),
    0,
  );
  const score = Math.round((points / metrics.length) * 100);
  const grade = score >= 88 ? "A" : score >= 75 ? "B" : score >= 60 ? "C" : "D";
  const verdict = score >= 80 ? "Approved" : score >= 60 ? "Conditional" : "Rejected";

  const failed = metrics.filter((m) => m.status === "fail");
  const warned = metrics.filter((m) => m.status === "warn");
  const passed = metrics.filter((m) => m.status === "pass");
  const generatedAt = new Date().toISOString();

  const markdown = [
    `# ${input.title}`,
    ``,
    `**Target:** ${input.platform}  `,
    `**Verdict:** ${verdict} (Grade ${grade}, ${score}/100)  `,
    `**Generated:** ${generatedAt}`,
    ``,
    `## Key Takeaways`,
    `- ${passed.length} of ${metrics.length} criteria passed, ${warned.length} flagged, ${failed.length} failed.`,
    `- Analyzed **${lines} lines** of source with ~${functions} callable units and **${observations} observation entries** (${numericSamples} numeric samples).`,
    failed.length
      ? `- Blocking issues: ${failed.map((m) => `\`${m.name}\``).join(", ")}.`
      : `- No blocking issues detected; submission is release-ready pending review.`,
    warned.length
      ? `- Watch items: ${warned.map((m) => `\`${m.name}\``).join(", ")}.`
      : `- No watch items.`,
    ``,
    `## Findings`,
    ...metrics.map(
      (m) =>
        `- **${m.name}** — threshold ${m.threshold}, observed ${m.observed} (${m.status.toUpperCase()}). ${m.note}.`,
    ),
    ``,
    `## Recommendation`,
    verdict === "Approved"
      ? `Proceed to sign-off. Archive lab data alongside the commit hash for traceability.`
      : verdict === "Conditional"
        ? `Address flagged items and re-run the evaluation before sign-off.`
        : `Rework required. Resolve failing criteria and re-collect lab data under controlled conditions.`,
  ].join("\n");

  return {
    id: seed.toString(16),
    generatedAt,
    input,
    score,
    grade,
    verdict,
    metrics,
    markdown,
    stats: { lines, functions, observations, numericSamples },
  };
}

export const SAMPLE_INPUT: EvaluationInput = {
  title: "Ring Buffer Telemetry Ingest",
  platform: "ARM Cortex-M7 / FreeRTOS",
  labData: `Run 1: throughput 1180 msg/s, p95 latency 84 ms, drop rate 0.4%
Run 2: throughput 1165 msg/s, p95 latency 91 ms, drop rate 0.6%
Run 3: throughput 1202 msg/s, p95 latency 79 ms, drop rate 0.3%
Peak heap 142 MB observed during burst test at 3200 msg/s.
Watchdog reset not triggered across 12h soak.`,
  code: `typedef struct { uint8_t *buf; size_t head, tail, cap; } ring_t;

int ring_push(ring_t *r, const uint8_t *src, size_t n) {
  if (n > ring_free(r)) return -1;
  for (size_t i = 0; i < n; i++) {
    r->buf[r->head] = src[i];
    r->head = (r->head + 1) % r->cap;
  }
  return 0;
}`,
};
