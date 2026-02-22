export type NetworkPostType = "post" | "blog" | "deal";

export type DealInterestType = "buy" | "sell" | "jv" | "partner";

export interface NetworkPost {
  id: string;
  author_id: string;
  title: string | null;
  content: string;
  type: NetworkPostType;
  deal_details: Record<string, unknown>;
  group_id: string | null;
  like_count: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
}

export interface NetworkPostWithAuthor extends NetworkPost {
  profiles?: { id: string; full_name: string | null; avatar_url: string | null } | null;
}

export interface NetworkPostComment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
}

export interface ProfileDealInterest {
  id: string;
  profile_id: string;
  interest_type: DealInterestType;
  title: string;
  description: string | null;
  property_type: string | null;
  location: string | null;
  budget_min_cents: number | null;
  budget_max_cents: number | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileReputationBadge {
  id: string;
  profile_id: string;
  badge_type: string;
  title: string;
  description: string | null;
  awarded_at: string;
}
