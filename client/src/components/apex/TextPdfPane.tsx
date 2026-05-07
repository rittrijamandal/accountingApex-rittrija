import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

/** Renders extracted text as a paginated PDF in an iframe (same approach as Grader workspace). */
export function TextPdfPane({ text, title }: { text: string; title?: string }) {
  const [src, setSrc] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const prevUrl = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function build() {
      try {
        const mod = await import("https://esm.sh/jspdf@2.5.1" as string);
        const jsPDF =
          (mod as unknown as { jsPDF?: unknown; default?: { jsPDF?: unknown } }).jsPDF ||
          (mod as unknown as { default?: { jsPDF?: unknown } }).default?.jsPDF ||
          (mod as unknown as { default?: unknown }).default;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const doc = new (jsPDF as any)({ unit: "mm", format: "a4" });
        const pageW: number = doc.internal.pageSize.getWidth();
        const pageH: number = doc.internal.pageSize.getHeight();
        const margin = 14;
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(9.5);
        let y = 18;
        for (const rawLine of (text || "").split("\n")) {
          const wrapped: string[] = doc.splitTextToSize(rawLine.length ? rawLine : " ", pageW - margin * 2);
          for (const line of wrapped) {
            if (y > pageH - 12) {
              doc.addPage();
              y = 18;
            }
            doc.text(line, margin, y);
            y += 4.8;
          }
        }
        if (cancelled) return;
        if (prevUrl.current) URL.revokeObjectURL(prevUrl.current);
        const url = URL.createObjectURL(doc.output("blob"));
        prevUrl.current = url;
        setSrc(url);
      } catch (e) {
        if (!cancelled) setErr((e as Error).message);
      }
    }
    build();
    return () => {
      cancelled = true;
    };
  }, [text]);

  if (err)
    return (
      <pre className="text-xs text-slate-500 p-4 font-mono rounded-xl bg-slate-50 border border-slate-100">
        PDF preview unavailable: {err}
        {"\n\n"}
        {text?.slice(0, 2000)}
      </pre>
    );
  if (!src)
    return (
      <div className="flex items-center gap-2 text-slate-400 text-sm p-8 justify-center rounded-xl bg-slate-50 border border-slate-100">
        <Loader2 className="h-4 w-4 animate-spin" /> Building PDF preview…
      </div>
    );
  return (
    <iframe src={src} title={title || "PDF"} className="w-full min-h-[520px] h-[70vh] rounded-xl border border-slate-200 bg-white" />
  );
}
