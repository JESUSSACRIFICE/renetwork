"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type {
  TrainingModule,
  TrainingProgress,
  TrainingModuleWithProgress,
} from "@/lib/training-types";

const db = supabase as any;

const TRAINING_KEY = ["training"] as const;

function moduleFromRow(row: Record<string, unknown>): TrainingModule {
  return {
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title),
    description: row.description != null ? String(row.description) : null,
    duration_minutes: Number(row.duration_minutes ?? 10),
    link_url: row.link_url != null ? String(row.link_url) : null,
    sort_order: Number(row.sort_order ?? 0),
    created_at: String(row.created_at),
  };
}

function progressFromRow(row: Record<string, unknown>): TrainingProgress {
  return {
    id: String(row.id),
    user_id: String(row.user_id),
    module_id: String(row.module_id),
    status: (row.status as TrainingProgress["status"]) ?? "not_started",
    started_at: row.started_at != null ? String(row.started_at) : null,
    completed_at: row.completed_at != null ? String(row.completed_at) : null,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

export function useTrainingModules(userId: string | null) {
  return useQuery({
    queryKey: [...TRAINING_KEY, "modules", userId],
    queryFn: async (): Promise<TrainingModuleWithProgress[]> => {
      const { data: modules, error: modErr } = await db
        .from("training_modules")
        .select("*")
        .order("sort_order", { ascending: true });

      if (modErr) throw modErr;
      const moduleList = (modules ?? []).map((r: Record<string, unknown>) =>
        moduleFromRow(r)
      );

      if (!userId) {
        return moduleList.map((m) => ({ ...m, progress: null }));
      }

      const moduleIds = moduleList.map((m) => m.id);
      const { data: progressRows, error: progErr } = await db
        .from("training_progress")
        .select("*")
        .eq("user_id", userId)
        .in("module_id", moduleIds);

      if (progErr) throw progErr;
      const progressByModule: Record<string, TrainingProgress> = {};
      (progressRows ?? []).forEach((r: Record<string, unknown>) => {
        const p = progressFromRow(r);
        progressByModule[p.module_id] = p;
      });

      return moduleList.map((m) => ({
        ...m,
        progress: progressByModule[m.id] ?? null,
      }));
    },
  });
}

export function useTrainingProgressSummary(userId: string | null) {
  return useQuery({
    queryKey: [...TRAINING_KEY, "summary", userId],
    queryFn: async () => {
      if (!userId) return { total: 0, completed: 0, inProgress: 0, percent: 0 };

      const { count: total } = await db
        .from("training_modules")
        .select("*", { count: "exact", head: true });

      const { data: progressRows } = await db
        .from("training_progress")
        .select("status")
        .eq("user_id", userId);

      const completed = (progressRows ?? []).filter(
        (r: { status: string }) => r.status === "completed"
      ).length;
      const inProgress = (progressRows ?? []).filter(
        (r: { status: string }) => r.status === "in_progress"
      ).length;
      const totalNum = (total ?? 0) as number;
      const percent = totalNum > 0 ? Math.round((completed / totalNum) * 100) : 0;

      return { total: totalNum, completed, inProgress, percent };
    },
    enabled: !!userId,
  });
}

export function useStartModule(userId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (moduleId: string) => {
      if (!userId) throw new Error("Not authenticated");
      const now = new Date().toISOString();
      const { data: existing } = await db
        .from("training_progress")
        .select("id")
        .eq("user_id", userId)
        .eq("module_id", moduleId)
        .maybeSingle();

      if (existing) {
        const { data, error } = await db
          .from("training_progress")
          .update({ status: "in_progress", started_at: now })
          .eq("user_id", userId)
          .eq("module_id", moduleId)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
      const { data, error } = await db
        .from("training_progress")
        .insert({
          user_id: userId,
          module_id: moduleId,
          status: "in_progress",
          started_at: now,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: TRAINING_KEY }),
  });
}

export function useCompleteModule(userId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (moduleId: string) => {
      if (!userId) throw new Error("Not authenticated");
      const now = new Date().toISOString();
      const { data: existing } = await db
        .from("training_progress")
        .select("id, started_at")
        .eq("user_id", userId)
        .eq("module_id", moduleId)
        .maybeSingle();

      if (existing) {
        const { data, error } = await db
          .from("training_progress")
          .update({ status: "completed", completed_at: now })
          .eq("user_id", userId)
          .eq("module_id", moduleId)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
      const { data, error } = await db
        .from("training_progress")
        .insert({
          user_id: userId,
          module_id: moduleId,
          status: "completed",
          started_at: now,
          completed_at: now,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: TRAINING_KEY }),
  });
}
