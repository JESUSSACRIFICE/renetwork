export interface InvestorCompliance {
  id: string;
  user_id: string;
  annual_income_cents: number | null;
  net_worth_cents: number | null;
  is_accredited: boolean;
  risk_acknowledged_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectComplianceChecklistItem {
  id: string;
  label: string;
  checked: boolean;
  notes?: string;
}

export interface CrowdfundingProjectCompliance {
  id: string;
  project_id: string;
  compliance_status: "pending" | "approved" | "rejected";
  checklist_json: ProjectComplianceChecklistItem[];
  admin_notes: string | null;
  approved_at: string | null;
  approved_by: string | null;
  created_at: string;
  updated_at: string;
}

/** Reg CF annual investment limit in cents (simplified: $124k = $12,400,000 cents) */
export const REG_CF_MAX_ANNUAL_CENTS = 12_400_000;

/**
 * Calculate Reg CF investment limit for non-accredited investors.
 * - If both income and net worth < $124k: 5% of greater
 * - If either >= $124k: 10% of greater, max $124k/year
 */
export function calculateRegCFLimit(
  annualIncomeCents: number,
  netWorthCents: number
): number {
  const threshold = 12_400_000; // $124,000
  const greater = Math.max(annualIncomeCents, netWorthCents);
  if (annualIncomeCents >= threshold && netWorthCents >= threshold) {
    return Math.min(Math.floor(greater * 0.1), REG_CF_MAX_ANNUAL_CENTS);
  }
  return Math.floor(greater * 0.05);
}
