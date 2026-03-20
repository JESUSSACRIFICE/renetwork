import { format } from "date-fns";
import type { RevenueReportRow } from "@/hooks/use-revenue-analytics";
import type { TimeRange } from "@/hooks/use-revenue-analytics";

export const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "1y", label: "Last year" },
];

export function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

export function formatDollars(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(n);
}

export function exportToCsv(rows: RevenueReportRow[]) {
  const headers = ["Date", "Type", "Title", "Amount", "Status"];
  const csvRows = [
    headers.join(","),
    ...rows.map((r) =>
      [
        r.date ? format(new Date(r.date), "yyyy-MM-dd") : "",
        r.type,
        `"${(r.title || "").replace(/"/g, '""')}"`,
        (r.amount_cents / 100).toFixed(2),
        r.status,
      ].join(",")
    ),
  ];
  const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `revenue-report-${format(new Date(), "yyyy-MM-dd")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export const GOAL_STORAGE_KEYS = {
  monthly: "earnings_goal_monthly",
  yearly: "earnings_goal_yearly",
} as const;
