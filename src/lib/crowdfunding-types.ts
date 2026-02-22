export type CrowdfundingProjectStatus =
  | "draft"
  | "pending_review"
  | "active"
  | "funded"
  | "closed"
  | "cancelled";

export type CrowdfundingCategory =
  | "real_estate"
  | "entertainment"
  | "recreation"
  | "other";

export type CrowdfundingPledgeStatus =
  | "pledged"
  | "confirmed"
  | "cancelled"
  | "refunded";

export type CrowdfundingVoteType = "up" | "down" | "interested";

export interface CrowdfundingProject {
  id: string;
  creator_id: string | null;
  title: string;
  slug: string | null;
  short_description: string | null;
  description: string | null;
  images: string[];
  category: CrowdfundingCategory | null;
  location: string | null;
  min_investment_cents: number;
  target_amount_cents: number;
  raised_amount_cents: number;
  expected_roi_pct: number | null;
  status: CrowdfundingProjectStatus;
  fund_allocation_json: FundAllocationItem[];
  deadline_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface FundAllocationItem {
  category: string;
  description?: string;
  amount_pct: number;
}

export interface CrowdfundingPledge {
  id: string;
  project_id: string;
  user_id: string;
  amount_cents: number;
  status: CrowdfundingPledgeStatus;
  return_amount_cents: number | null;
  return_paid_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CrowdfundingVote {
  id: string;
  project_id: string;
  user_id: string;
  vote_type: CrowdfundingVoteType;
  created_at: string;
}

export interface CrowdfundingNotification {
  id: string;
  user_id: string;
  project_id: string | null;
  pledge_id: string | null;
  type: string;
  title: string;
  message: string | null;
  read_at: string | null;
  created_at: string;
}
