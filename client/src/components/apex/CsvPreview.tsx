import { cn } from "@/lib/utils";

/** Minimal RFC4180-ish CSV line parser (matches GraderWorkspace CsvGrid). */
function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let cur = "";
  let inQ = false;
  for (const ch of line + ",") {
    if (ch === '"') inQ = !inQ;
    else if (ch === "," && !inQ) {
      cells.push(cur.trim());
      cur = "";
    } else cur += ch;
  }
  return cells;
}

const colLetter = (n: number) => {
  let s = "";
  let r = n;
  while (r >= 0) {
    s = String.fromCharCode(65 + (r % 26)) + s;
    r = Math.floor(r / 26) - 1;
  }
  return s;
};

/** Scrollable spreadsheet-style preview for review / data-room contexts. */
export function CsvPreview({ csv }: { csv: string }) {
  const lines = csv.trim().split(/\r?\n/).filter((l) => l.trim());
  if (!lines.length) return <div className="text-slate-400 italic text-sm py-4">Empty.</div>;

  const header = parseCsvLine(lines[0]);
  const bodyLines = lines.slice(1, 201);

  return (
    <div className="overflow-auto rounded-xl border border-slate-200 max-h-[min(70vh,520px)]">
      <table className="text-xs w-max min-w-full border-collapse font-mono">
        <thead>
          <tr className="bg-slate-100">
            <th className="sticky left-0 z-10 w-9 px-2 py-1.5 border border-slate-200 text-right text-[10px] text-slate-400 bg-slate-100" />
            {header.map((_, i) => (
              <th
                key={i}
                className="px-3 py-1.5 text-indigo-700 font-semibold border border-slate-200 text-[10px] whitespace-nowrap"
              >
                {colLetter(i)}
              </th>
            ))}
          </tr>
          <tr className="bg-indigo-50/50">
            <td className="sticky left-0 z-10 px-2 py-2 text-slate-500 text-[10px] text-right border border-slate-200 bg-indigo-50/50">
              1
            </td>
            {header.map((h, i) => (
              <th
                key={i}
                className="px-3 py-2 text-slate-800 font-semibold border border-slate-200 text-left whitespace-nowrap max-w-[240px]"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bodyLines.map((line, ri) => {
            const cells = parseCsvLine(line);
            return (
              <tr key={ri} className="hover:bg-slate-50/80">
                <td className="sticky left-0 z-10 px-2 py-1 text-slate-400 text-[10px] text-right border border-slate-200 bg-white">
                  {ri + 2}
                </td>
                {cells.map((c, ci) => {
                  const num = parseFloat(c.replace(/[^0-9.-]/g, ""));
                  const isAmt = ci > 0 && !isNaN(num) && c !== "" && /[$\d(]/.test(c);
                  return (
                    <td
                      key={ci}
                      className={cn(
                        "px-3 py-1 border border-slate-200 whitespace-nowrap max-w-[320px] truncate",
                        isAmt && num < 0 && "text-red-600",
                        isAmt && num > 0 && "text-emerald-700",
                      )}
                      title={c}
                    >
                      {c}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      {lines.length > 201 && (
        <p className="text-[10px] text-slate-400 px-3 py-2 border-t border-slate-100 bg-slate-50">
          Showing first 200 data rows ({lines.length - 1} total rows).
        </p>
      )}
    </div>
  );
}
