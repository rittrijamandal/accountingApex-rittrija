import * as pdfjs from "pdfjs-dist";
import pdfWorkerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;

/** Extract plain text from PDF bytes (best-effort; image-only PDFs return an explanatory placeholder). */
export async function pdfBytesToExtractedText(u8: Uint8Array, label: string): Promise<string> {
  try {
    const loadingTask = pdfjs.getDocument({ data: u8, useSystemFonts: true });
    const pdf = await loadingTask.promise;
    const chunks: string[] = [];
    for (let p = 1; p <= pdf.numPages; p++) {
      const page = await pdf.getPage(p);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item) => ("str" in item ? item.str : ""))
        .filter(Boolean)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
      if (pageText) chunks.push(pageText);
    }
    const text = chunks.join("\n\n").trim();
    if (!text) {
      return `[PDF (no extractable text — may be scanned): ${label} — ${u8.byteLength} bytes. Paste text in the Expert editor if needed.]`;
    }
    return text;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return `[PDF extraction failed: ${label} — ${msg}]`;
  }
}
