import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeExample } from "./code-example";
export function MarkdownReference({ children }: { children: string }) {
  return <div className="library-markdown"><Markdown remarkPlugins={[remarkGfm]} components={{
    h1: ({ children }) => <h3>{children}</h3>,
    h2: ({ children }) => <h4>{children}</h4>,
    h3: ({ children }) => <h5>{children}</h5>,
    h4: ({ children }) => <h6>{children}</h6>,
    pre: ({ children }) => <>{children}</>,
    code: ({ children, className }) => {
      const text = String(children);
      const language = /language-([\w-]+)/.exec(className ?? "")?.[1];
      return language || text.includes("\n") ? <CodeExample code={text.replace(/\n$/, "")} language={language ?? "text"}/> : <code>{children}</code>;
    },
    table: ({ children }) => <div className="library-api-scroll"><table className="library-mapping">{children}</table></div>,
  }}>{children}</Markdown></div>;
}
