export interface TrainingModule {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  duration_minutes: number;
  link_url: string | null;
  sort_order: number;
  created_at: string;
}

export type TrainingProgressStatus = "not_started" | "in_progress" | "completed";

export interface TrainingProgress {
  id: string;
  user_id: string;
  module_id: string;
  status: TrainingProgressStatus;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TrainingModuleWithProgress extends TrainingModule {
  progress: TrainingProgress | null;
}
