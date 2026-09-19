import type { ReactNode } from "react";

/** Minimal, safe markdown renderer for the deterministic report format. */
function inline(text: string, key: number): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return (
    <span key={key}>
      {parts.map((p, i) => {
        if (p.startsWith("**") && p.endsWith("**")) return <strong key={i}>{p.slice(2, -2)}</strong>;
        if (p.startsWith("`") && p.endsWith("`")) return <code key={i}>{p.slice(1, -1)}</code>;
        return p;
      })}
    </span>
  );
}

export function Markdown({ source }: { source: string }) {
  const lines = source.split("\n");
  const out: ReactNode[] = [];
  let list: string[] = [];
  let para: string[] = [];

  const flushList = () => {
    if (list.length) {
      out.push(
        <ul key={`ul-${out.length}`}>
          {list.map((l, i) => (
            <li key={i}>{inline(l, i)}</li>
          ))}
        </ul>,
      );
      list = [];
    }
  };
  const flushPara = () => {
    if (para.length) {
      out.push(
        <p key={`p-${out.length}`}>
          {para.map((l, i) => (
            <span key={i}>
              {inline(l.replace(/\s+$/, ""), i)}
              {i < para.length - 1 && <br />}
            </span>
          ))}
        </p>,
      );
      para = [];
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (line.startsWith("# ")) {
      flushList();
      flushPara();
      out.push(<h1 key={`h1-${out.length}`}>{line.slice(2)}</h1>);
    } else if (line.startsWith("## ")) {
      flushList();
      flushPara();
      out.push(<h2 key={`h2-${out.length}`}>{line.slice(3)}</h2>);
    } else if (line.startsWith("- ")) {
      flushPara();
      list.push(line.slice(2));
    } else if (line.trim() === "") {
      flushList();
      flushPara();
    } else {
      flushList();
      para.push(raw);
    }
  }
  flushList();
  flushPara();

  return <div className="prose-report">{out}</div>;
}
