import { cn } from "@/lib/utils";
import type { ReviewStatus } from "@/lib/types";

const map: Record<ReviewStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-700",
  "IN REVIEW": "bg-indigo-50 text-indigo-700",
  "NEEDS REWORK": "bg-red-50 text-red-700",
  APPROVED: "bg-emerald-50 text-emerald-700",
  REJECTED: "bg-red-50 text-red-700",
};

export function StatusPill({ status, className }: { status: ReviewStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        map[status],
        className
      )}
    >
      {status}
    </span>
  );
}
