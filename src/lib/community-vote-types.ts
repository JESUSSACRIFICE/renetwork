export type CommunityVoteItemType = "location" | "feature";
export type CommunityVoteItemStatus = "open" | "planned" | "built";

export interface CommunityVoteItem {
  id: string;
  title: string;
  description: string | null;
  item_type: CommunityVoteItemType;
  status: CommunityVoteItemStatus;
  vote_count: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}
