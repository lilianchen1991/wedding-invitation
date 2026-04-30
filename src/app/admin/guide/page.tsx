import fs from "fs";
import path from "path";
import Link from "next/link";

export default function AdminGuidePage() {
  const md = fs.readFileSync(path.join(process.cwd(), "GUIDE.md"), "utf-8");

  const lines = md.split("\n");
  const elements: { type: string; content: string; items?: string[] }[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("# ")) {
      elements.push({ type: "h1", content: line.slice(2) });
    } else if (line.startsWith("## ")) {
      elements.push({ type: "h2", content: line.slice(3) });
    } else if (line.startsWith("### ")) {
      elements.push({ type: "h3", content: line.slice(4) });
    } else if (line.startsWith("#### ")) {
      elements.push({ type: "h4", content: line.slice(5) });
    } else if (line.startsWith("```")) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push({ type: "code", content: codeLines.join("\n") });
    } else if (line.startsWith("| ") && lines[i + 1]?.startsWith("|")) {
      const tableLines: string[] = [line];
      i++;
      while (i < lines.length && lines[i].startsWith("|")) {
        if (!lines[i].match(/^\|\s*-+/)) {
          tableLines.push(lines[i]);
        }
        i++;
      }
      i--;
      elements.push({ type: "table", content: tableLines.join("\n") });
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      const items: string[] = [];
      while (i < lines.length && (lines[i].startsWith("- ") || lines[i].startsWith("* "))) {
        items.push(lines[i].slice(2));
        i++;
      }
      i--;
      elements.push({ type: "list", content: "", items });
    } else if (line.startsWith("> ")) {
      elements.push({ type: "blockquote", content: line.slice(2) });
    } else if (line.startsWith("**Q:")) {
      const q = line.replace(/\*\*/g, "");
      i++;
      const a = lines[i]?.replace(/^A:\s*/, "").replace(/\*\*/g, "") || "";
      elements.push({ type: "qa", content: q + "\n" + a });
    } else if (line === "---") {
      elements.push({ type: "hr", content: "" });
    } else if (line.trim()) {
      elements.push({ type: "p", content: line.replace(/\*\*/g, "").replace(/`([^`]+)`/g, "$1") });
    }
    i++;
  }

  function renderTable(raw: string) {
    const rows = raw.split("\n").map((r) =>
      r.split("|").filter(Boolean).map((c) => c.trim())
    );
    if (rows.length < 2) return null;
    const header = rows[0];
    const body = rows.slice(1);
    return (
      <div className="overflow-x-auto mb-4">
        <table className="w-full text-sm border border-border">
          <thead>
            <tr className="bg-bg-alt">
              {header.map((h, j) => (
                <th key={j} className="text-left px-3 py-2 border-b border-border font-medium text-primary">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {body.map((row, j) => (
              <tr key={j} className="border-b border-border last:border-0">
                {row.map((cell, k) => (
                  <td key={k} className="px-3 py-2 text-text-light">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-serif text-2xl text-primary">使用说明</h1>
        <Link
          href="/admin"
          className="text-sm text-accent hover:text-accent/80 transition-colors"
        >
          ← 返回后台
        </Link>
      </div>

      <div className="bg-white border border-border rounded-lg px-8 py-6">
        {elements.map((el, idx) => {
          switch (el.type) {
            case "h1":
              return <h1 key={idx} className="font-serif text-2xl text-primary mb-4 mt-8 first:mt-0">{el.content}</h1>;
            case "h2":
              return <h2 key={idx} className="font-serif text-xl text-primary mb-3 mt-8 pt-6 border-t border-border first:border-0 first:pt-0">{el.content}</h2>;
            case "h3":
              return <h3 key={idx} className="font-medium text-primary mb-2 mt-5">{el.content}</h3>;
            case "h4":
              return <h4 key={idx} className="font-medium text-sm text-primary mb-2 mt-4">{el.content}</h4>;
            case "p":
              return <p key={idx} className="text-sm text-text-light leading-relaxed mb-3">{el.content}</p>;
            case "list":
              return (
                <ul key={idx} className="mb-4 space-y-1">
                  {el.items?.map((item, j) => (
                    <li key={j} className="text-sm text-text-light pl-4 relative before:content-['·'] before:absolute before:left-0 before:text-accent">
                      {item}
                    </li>
                  ))}
                </ul>
              );
            case "table":
              return <div key={idx}>{renderTable(el.content)}</div>;
            case "code":
              return (
                <pre key={idx} className="bg-gray-50 border border-border rounded px-4 py-3 mb-4 overflow-x-auto">
                  <code className="text-xs text-gray-700">{el.content}</code>
                </pre>
              );
            case "blockquote":
              return (
                <div key={idx} className="border-l-3 border-accent bg-amber-50 px-4 py-2 mb-4 text-sm text-amber-800">
                  {el.content}
                </div>
              );
            case "qa": {
              const [q, a] = el.content.split("\n");
              return (
                <div key={idx} className="mb-4">
                  <p className="text-sm font-medium text-primary mb-1">{q}</p>
                  <p className="text-sm text-text-light">{a}</p>
                </div>
              );
            }
            case "hr":
              return <hr key={idx} className="border-border my-6" />;
            default:
              return null;
          }
        })}
      </div>
    </div>
  );
}
