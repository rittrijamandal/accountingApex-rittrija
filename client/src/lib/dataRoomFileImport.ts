import JSZip from "jszip";
import { read as readXlsxWorkbook, utils as xlsxUtils } from "xlsx";
import type { UploadedFile } from "@/lib/types";
import { pdfBytesToExtractedText } from "@/lib/pdfExtract";

function uid() {
  return `f_${Math.random().toString(36).slice(2, 9)}`;
}

const TEXT_LIKE = /\.(csv|txt|json|md|html|xml|tsv|log)$/i;

/** True when extractedText is a synthetic placeholder, not parseable grid/PDF body */
export function isExtractedTextPlaceholder(s: string): boolean {
  const t = s.trim();
  return /^\[(From ZIP:|Imported:|PDF in ZIP:|PDF:|PDF extraction failed:|PDF \(no extractable text|Image file:|Spreadsheet parse error:|Empty spreadsheet:)/.test(
    t,
  );
}

async function spreadsheetBytesToCsv(u8: Uint8Array, label: string): Promise<string> {
  try {
    // Static ESM imports — dynamic import("xlsx") can resolve to the CJS build and throw "exports is not defined" in the browser.
    const wb = readXlsxWorkbook(u8, { type: "array", cellDates: true });
    if (!wb.SheetNames?.length) return `[Empty spreadsheet: ${label}]`;
    const first = wb.SheetNames[0]!;
    const ws = wb.Sheets[first]!;
    return xlsxUtils.sheet_to_csv(ws);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return `[Spreadsheet parse error: ${label} — ${msg}]`;
  }
}

function mimeFromPath(p: string) {
  const ext = String(p).split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "application/pdf";
  if (ext === "csv") return "text/csv";
  if (ext === "xlsx" || ext === "xls") return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  if (ext === "png" || ext === "jpg" || ext === "jpeg" || ext === "gif" || ext === "webp") return `image/${ext === "jpg" ? "jpeg" : ext}`;
  return "application/octet-stream";
}

/** Best-effort doc type from path/name for data-room classification */
export function inferDocTypeFromPath(path: string): string {
  const p = path.toLowerCase().replace(/\\/g, "/");
  const base = p.split("/").pop() || p;
  if (/chart|coa|chart_of|accounts.*csv/.test(base)) return "chart_of_accounts";
  if (/general_ledger|gl\.csv|^gl_|ledger/.test(base)) return "general_ledger";
  if (/trial_balance|trial\.csv/.test(base)) return "trial_balance";
  if (/bank_statement|bank\.csv|statement/.test(base)) return "bank_statement";
  if (/invoice/.test(base)) return "invoice";
  if (/receipt/.test(base)) return "receipt";
  if (/payroll/.test(base)) return "payroll_report";
  if (/tax/.test(base)) return "tax_document";
  if (/expense.*policy|policy/.test(base)) return "expense_policy";
  if (/memo/.test(base)) return "management_memo";
  if (/\.csv$/.test(base)) return "general_ledger";
  return "invoice";
}

async function readExtractedText(file: File, u8: Uint8Array): Promise<string> {
  const name = file.name.toLowerCase();
  if (TEXT_LIKE.test(file.name)) {
    return new TextDecoder().decode(u8);
  }
  if (/\.(xlsx|xls)$/i.test(file.name)) {
    return spreadsheetBytesToCsv(u8, file.name);
  }
  if (/\.(png|jpe?g|gif|webp)$/i.test(file.name)) {
    return `[Image file: ${file.name} — ${u8.byteLength} bytes. Add notes if the grader should treat this asset specially.]`;
  }
  if (name.endsWith(".pdf")) {
    return pdfBytesToExtractedText(u8, file.name);
  }
  const mime = file.type || mimeFromPath(file.name);
  return `[Imported: ${file.name} — ${u8.byteLength} bytes (${mime}). Paste extracted text below if needed.]`;
}

/** Single filesystem file → data-room row */
export async function fileToUploadedFile(file: File): Promise<UploadedFile> {
  const buf = await file.arrayBuffer();
  const u8 = new Uint8Array(buf);
  const type = inferDocTypeFromPath(file.name);
  const extractedText = await readExtractedText(file, u8);
  return {
    id: uid(),
    type,
    customType: "",
    displayLabel: file.name,
    notes: "",
    extractedText,
    fileName: file.name,
    mimeType: file.type || mimeFromPath(file.name),
    sizeBytes: file.size,
    isMisleading: false,
    gridRows: [],
  };
}

/** Expand ZIP archive → one UploadedFile per entry (skips dirs and junk paths) */
export async function expandZipToUploadedFiles(zipFile: File): Promise<UploadedFile[]> {
  const zip = await JSZip.loadAsync(await zipFile.arrayBuffer());
  const out: UploadedFile[] = [];
  const paths = Object.keys(zip.files)
    .filter((p) => {
      const e = zip.files[p];
      if (e.dir) return false;
      if (p.includes("__MACOSX/") || p.startsWith(".")) return false;
      if (p.endsWith(".DS_Store")) return false;
      return true;
    })
    .sort();

  for (const path of paths) {
    const entry = zip.files[path];
    const base = path.split("/").pop() || path;
    const u8 = await entry.async("uint8array");
    const type = inferDocTypeFromPath(path);
    let extractedText: string;
    const baseLower = base.toLowerCase();
    if (TEXT_LIKE.test(base)) {
      extractedText = new TextDecoder().decode(u8);
    } else if (baseLower.endsWith(".xlsx") || baseLower.endsWith(".xls")) {
      extractedText = await spreadsheetBytesToCsv(u8, path);
    } else if (baseLower.endsWith(".pdf")) {
      extractedText = await pdfBytesToExtractedText(u8, path);
    } else {
      extractedText = `[From ZIP: ${path} — ${u8.byteLength} bytes (${mimeFromPath(base)})]`;
    }
    out.push({
      id: uid(),
      type,
      customType: "",
      displayLabel: base,
      notes: `Imported from ${zipFile.name}`,
      extractedText,
      fileName: base,
      mimeType: mimeFromPath(base),
      sizeBytes: u8.byteLength,
      isMisleading: false,
      gridRows: [],
    });
  }
  return out;
}

/** Legacy fileworld → uploadedFiles rows (matches expert-world-app mapping) */
const CUSTOM_TYPE_ID = "__custom__";

const FILEWORLD_TYPE_MAP: Record<string, string> = {
  policy: "expense_policy",
  invoice: "invoice",
  ledger: "general_ledger",
  bank: "bank_statement",
  payroll: "payroll_report",
};

const FILEWORLD_CUSTOM_LABEL: Record<string, string> = {
  workpaper: "Work Paper",
  email: "Email",
  contract: "Contract",
  spreadsheet: "Spreadsheet",
  report: "Report",
};

function normalizeUploadedRow(f: UploadedFile & Record<string, unknown>): UploadedFile {
  return {
    id: typeof f.id === "string" ? f.id : uid(),
    type: typeof f.type === "string" ? f.type : "invoice",
    customType: typeof f.customType === "string" ? f.customType : "",
    displayLabel: typeof f.displayLabel === "string" ? f.displayLabel : String(f.fileName || ""),
    notes: typeof f.notes === "string" ? f.notes : "",
    extractedText: typeof f.extractedText === "string" ? f.extractedText : "",
    fileName: typeof f.fileName === "string" ? f.fileName : "",
    mimeType: typeof f.mimeType === "string" ? f.mimeType : "",
    sizeBytes: typeof f.sizeBytes === "number" ? f.sizeBytes : 0,
    isMisleading: Boolean(f.isMisleading),
    gridRows: Array.isArray(f.gridRows) ? (f.gridRows as Record<string, string>[]) : [],
  };
}

function fileworldEntriesToUploadedFiles(files: unknown[]): UploadedFile[] {
  return files.map((raw) => {
    const f = raw as {
      type?: string;
      path?: string;
      name?: string;
      content?: string;
      isMisleading?: boolean;
    };
    const fwType = String(f.type || "");
    const mappedType = FILEWORLD_TYPE_MAP[fwType] || CUSTOM_TYPE_ID;
    const path = f.path || f.name || "";
    return {
      id: uid(),
      type: mappedType,
      customType:
        mappedType === CUSTOM_TYPE_ID ? FILEWORLD_CUSTOM_LABEL[fwType] || fwType || "Document" : "",
      displayLabel: path,
      notes: "",
      extractedText: typeof f.content === "string" ? f.content : "",
      fileName: String(path).split("/").pop(),
      mimeType: mimeFromPath(String(path)),
      sizeBytes: typeof f.content === "string" ? f.content.length : 0,
      isMisleading: Boolean(f.isMisleading),
      gridRows: [],
    };
  });
}

/** Merge uploadedFiles + legacy fileworld `payload.files` for review / display */
export function getDataRoomFilesFromPayload(payload: unknown): UploadedFile[] {
  if (!payload || typeof payload !== "object") return [];
  const p = payload as Record<string, unknown>;
  if (Array.isArray(p.uploadedFiles) && p.uploadedFiles.length > 0) {
    return (p.uploadedFiles as UploadedFile[]).map((row) =>
      normalizeUploadedRow(row as UploadedFile & Record<string, unknown>),
    );
  }
  if (Array.isArray(p.files) && p.files.length > 0) {
    return fileworldEntriesToUploadedFiles(p.files);
  }
  return [];
}

/** Files from picker or drop — expands each .zip inline */
export async function importFilesForDataRoom(files: FileList | File[]): Promise<UploadedFile[]> {
  const arr = Array.from(files as File[]);
  const out: UploadedFile[] = [];
  for (const f of arr) {
    if (f.name.toLowerCase().endsWith(".zip")) {
      out.push(...(await expandZipToUploadedFiles(f)));
    } else {
      out.push(await fileToUploadedFile(f));
    }
  }
  return out;
}
