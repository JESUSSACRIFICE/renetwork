"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type {
  InvestorCompliance,
  CrowdfundingProjectCompliance,
  ProjectComplianceChecklistItem,
} from "@/lib/compliance-types";
import {
  calculateRegCFLimit,
  REG_CF_MAX_ANNUAL_CENTS,
} from "@/lib/compliance-types";

/**
 * `investor_compliance` and `crowdfunding_project_compliance` are not in the generated
 * `Database` typings. Using the typed client makes TypeScript hit "excessively deep"
 * instantiation on `.from("…")`. Route those calls through an untyped handle.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- tables missing from Database
const supabaseCompliance = supabase as any;

function investorComplianceFromRow(row: Record<string, unknown>): InvestorCompliance {
  return {
    id: String(row.id),
    user_id: String(row.user_id),
    annual_income_cents: row.annual_income_cents != null ? Number(row.annual_income_cents) : null,
    net_worth_cents: row.net_worth_cents != null ? Number(row.net_worth_cents) : null,
    is_accredited: Boolean(row.is_accredited),
    risk_acknowledged_at: row.risk_acknowledged_at ? String(row.risk_acknowledged_at) : null,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

function parseChecklist(val: unknown): ProjectComplianceChecklistItem[] {
  if (!val || !Array.isArray(val)) return [];
  return val.map((item: unknown) => ({
    id: typeof item === "object" && item && "id" in item ? String((item as { id: unknown }).id) : "",
    label: typeof item === "object" && item && "label" in item ? String((item as { label: unknown }).label) : "",
    checked: typeof item === "object" && item && "checked" in item ? Boolean((item as { checked: unknown }).checked) : false,
    notes: typeof item === "object" && item && "notes" in item ? String((item as { notes?: unknown }).notes ?? "") : undefined,
  }));
}

function projectComplianceFromRow(row: Record<string, unknown>): CrowdfundingProjectCompliance {
  return {
    id: String(row.id),
    project_id: String(row.project_id),
    compliance_status: row.compliance_status as CrowdfundingProjectCompliance["compliance_status"],
    checklist_json: parseChecklist(row.checklist_json),
    admin_notes: row.admin_notes ? String(row.admin_notes) : null,
    approved_at: row.approved_at ? String(row.approved_at) : null,
    approved_by: row.approved_by ? String(row.approved_by) : null,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

export function useInvestorCompliance(userId: string | null) {
  return useQuery({
    queryKey: ["compliance", "investor", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabaseCompliance
        .from("investor_compliance")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      if (error) throw error;
      return data ? investorComplianceFromRow(data as Record<string, unknown>) : null;
    },
    enabled: !!userId,
  });
}

export function useUpsertInvestorCompliance(userId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      annual_income_cents?: number | null;
      net_worth_cents?: number | null;
      is_accredited?: boolean;
      risk_acknowledged?: boolean;
    }) => {
      if (!userId) throw new Error("Missing user");
      const updates: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };
      if (params.annual_income_cents !== undefined) updates.annual_income_cents = params.annual_income_cents;
      if (params.net_worth_cents !== undefined) updates.net_worth_cents = params.net_worth_cents;
      if (params.is_accredited !== undefined) updates.is_accredited = params.is_accredited;
      if (params.risk_acknowledged) {
        updates.risk_acknowledged_at = new Date().toISOString();
      }

      const { data, error } = await supabaseCompliance
        .from("investor_compliance")
        .upsert(
          { user_id: userId, ...updates },
          { onConflict: "user_id" }
        )
        .select()
        .single();
      if (error) throw error;
      return investorComplianceFromRow(data as Record<string, unknown>);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["compliance", "investor"] });
    },
  });
}

export function useAcknowledgeRisk(userId: string | null) {
  return useUpsertInvestorCompliance(userId);
}

export function useProjectCompliance(projectId: string | null) {
  return useQuery({
    queryKey: ["compliance", "project", projectId],
    queryFn: async () => {
      if (!projectId) return null;
      const { data, error } = await supabaseCompliance
        .from("crowdfunding_project_compliance")
        .select("*")
        .eq("project_id", projectId)
        .maybeSingle();
      if (error) throw error;
      return data ? projectComplianceFromRow(data as Record<string, unknown>) : null;
    },
    enabled: !!projectId,
  });
}

export function useAdminPendingProjects() {
  return useQuery({
    queryKey: ["compliance", "admin", "pending"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crowdfunding_projects")
        .select(`
          *,
          crowdfunding_project_compliance(*)
        `)
        .in("status", ["draft", "pending_review"])
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useUpdateProjectStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { projectId: string; status: string }) => {
      const { error } = await supabase
        .from("crowdfunding_projects")
        .update({ status: params.status })
        .eq("id", params.projectId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crowdfunding"] });
      queryClient.invalidateQueries({ queryKey: ["compliance", "admin"] });
    },
  });
}

export function useUpdateProjectCompliance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      projectId: string;
      compliance_status?: "pending" | "approved" | "rejected";
      checklist_json?: ProjectComplianceChecklistItem[];
      admin_notes?: string | null;
    }) => {
      const updates: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };
      if (params.compliance_status !== undefined) {
        updates.compliance_status = params.compliance_status;
        if (params.compliance_status === "approved" || params.compliance_status === "rejected") {
          updates.approved_at = new Date().toISOString();
          updates.approved_by = (await supabase.auth.getUser()).data.user?.id ?? null;
        }
      }
      if (params.checklist_json !== undefined) updates.checklist_json = params.checklist_json;
      if (params.admin_notes !== undefined) updates.admin_notes = params.admin_notes;

      const { error } = await supabaseCompliance
        .from("crowdfunding_project_compliance")
        .update(updates)
        .eq("project_id", params.projectId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["compliance"] });
    },
  });
}

/** Check if user can invest: has compliance, risk acknowledged, within limits */
export function useInvestmentEligibility(
  userId: string | null,
  amountCents: number,
  existingPledgesCents: number = 0
) {
  const { data: compliance } = useInvestorCompliance(userId);

  const totalPledgedThisYear = existingPledgesCents;
  const limitCents = compliance?.is_accredited
    ? REG_CF_MAX_ANNUAL_CENTS * 10 // Accredited: no practical limit
    : compliance?.annual_income_cents != null && compliance?.net_worth_cents != null
      ? calculateRegCFLimit(
          compliance.annual_income_cents,
          compliance.net_worth_cents
        )
      : 0;

  const hasCompliance = !!compliance && (compliance.annual_income_cents != null || compliance.net_worth_cents != null || compliance.is_accredited);
  const riskAcknowledged = !!compliance?.risk_acknowledged_at;
  const withinLimit = compliance?.is_accredited || (totalPledgedThisYear + amountCents <= limitCents);
  const canInvest = !!userId && hasCompliance && riskAcknowledged && withinLimit;

  return {
    canInvest,
    hasCompliance,
    riskAcknowledged,
    withinLimit,
    limitCents,
    totalPledgedThisYear,
    missingReasons: [
      !userId && "Sign in required",
      !hasCompliance && "Complete investor profile (income/net worth)",
      !riskAcknowledged && "Acknowledge investment risks",
      !withinLimit && `Investment limit exceeded (limit: $${(limitCents / 100).toLocaleString()})`,
    ].filter(Boolean) as string[],
  };
}
