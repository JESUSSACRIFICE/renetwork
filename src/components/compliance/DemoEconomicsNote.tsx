import { cn } from "@/lib/utils";

/**
 * Marketplace percentages and payout copy in this slice are sample framing.
 * Settlement-adjacent referral fees are not a live product.
 */
export function DemoEconomicsNote({ className }: { className?: string }) {
  return (
    <p className={cn("text-sm leading-relaxed text-muted-foreground", className)}>
      <span className="mr-1.5 inline-flex items-center rounded-full border border-amber-800/25 bg-amber-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber-950">
        Demo
      </span>
      Sample marketplace economics only. Mortgage, title, and escrow
      pay-for-referral payouts are not enabled.
    </p>
  );
}
