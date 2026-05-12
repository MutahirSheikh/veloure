import { cn } from "@/lib/utils";

export function MarkdownPreview({ value, className }: { value: string | null | undefined; className?: string }) {
  const blocks = (value || "").split(/\n{2,}/).filter(Boolean);

  return (
    <div className={cn("prose prose-neutral max-w-none", className)}>
      {blocks.length === 0 ? (
        <p>No description has been added.</p>
      ) : (
        blocks.map((block, index) => {
          if (block.startsWith("### ")) return <h3 key={index}>{block.replace(/^### /, "")}</h3>;
          if (block.startsWith("## ")) return <h2 key={index}>{block.replace(/^## /, "")}</h2>;
          if (block.startsWith("# ")) return <h1 key={index}>{block.replace(/^# /, "")}</h1>;
          if (block.includes("\n- ")) {
            const items = block
              .split("\n")
              .map((line) => line.replace(/^- /, "").trim())
              .filter(Boolean);
            return (
              <ul key={index}>
                {items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            );
          }
          return <p key={index}>{block}</p>;
        })
      )}
    </div>
  );
}
