import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Play, Sparkles, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import {
  evaluationInputSchema,
  LIMITS,
  SAMPLE_INPUT,
  type EvaluationInput,
} from "@/lib/evaluation";

interface Props {
  onSubmit: (values: EvaluationInput) => void;
  onReset: () => void;
  isRunning: boolean;
}

const EMPTY: EvaluationInput = { title: "", platform: "", labData: "", code: "" };

function Counter({ value, max }: { value: number; max: number }) {
  const over = value > max;
  return (
    <span
      className={cn(
        "font-mono text-[11px] tabular-nums",
        over ? "text-danger" : "text-muted-foreground",
      )}
    >
      {value}/{max}
    </span>
  );
}

export function ParameterForm({ onSubmit, onReset, isRunning }: Props) {
  const form = useForm<EvaluationInput>({
    resolver: zodResolver(evaluationInputSchema),
    defaultValues: EMPTY,
    mode: "onTouched",
  });

  const values = form.watch();

  const handleInvalid = () => {
    const count = Object.keys(form.formState.errors).length;
    toast.error("Validation failed", {
      description: `${count} field${count === 1 ? "" : "s"} need attention before running.`,
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, handleInvalid)}
        className="flex h-full flex-col gap-5"
        noValidate
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Project Title</FormLabel>
                <Counter value={field.value.length} max={LIMITS.title.max} />
              </div>
              <FormControl>
                <Input placeholder="e.g. Ring Buffer Telemetry Ingest" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="platform"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Target Platform / Architecture</FormLabel>
                <Counter value={field.value.length} max={LIMITS.platform.max} />
              </div>
              <FormControl>
                <Input placeholder="e.g. ARM Cortex-M7 / FreeRTOS" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="labData"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Raw Lab Data / Observations</FormLabel>
                <Counter value={field.value.length} max={LIMITS.labData.max} />
              </div>
              <FormControl>
                <Textarea
                  rows={6}
                  placeholder="One observation per line. Include numeric readings for richer metrics."
                  className="resize-y font-mono text-xs leading-relaxed"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Source Code Snippet</FormLabel>
                <Counter value={field.value.length} max={LIMITS.code.max} />
              </div>
              <FormControl>
                <Textarea
                  rows={9}
                  placeholder="Paste the function or module under evaluation."
                  className="resize-y font-mono text-xs leading-relaxed"
                  spellCheck={false}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
          <Button type="submit" variant="run" disabled={isRunning} className="flex-1 sm:flex-none">
            <Play />
            {isRunning ? "Evaluating…" : "Run Evaluation"}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={isRunning}
            onClick={() => {
              form.reset(SAMPLE_INPUT);
              toast("Sample loaded", { description: "Filled all fields with a demo dataset." });
            }}
          >
            <Sparkles />
            Load sample
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Reset form"
            disabled={isRunning || !Object.values(values).some(Boolean)}
            onClick={() => {
              form.reset(EMPTY);
              onReset();
            }}
          >
            <RotateCcw />
          </Button>
        </div>
      </form>
    </Form>
  );
}
