import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";

export function Markdown({ source }: { source: string }) {
  return (
    <div className="prose-report">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
        {source}
      </ReactMarkdown>
    </div>
  );
}
