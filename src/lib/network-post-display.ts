import { format, isValid } from "date-fns";
import type { NetworkPostType } from "@/lib/networking-types";

/** Readable “Facebook-style” timestamp, e.g. Mar 22, 2025 at 3:45 PM */
export function formatPostTimestamp(iso: string): string {
  const d = new Date(iso);
  if (!isValid(d)) return "";
  return format(d, "MMM d, yyyy 'at' h:mm a");
}

/** Subtitle under author name (activity line) */
export const NETWORK_POST_ACTIVITY_LINE: Record<NetworkPostType, string> = {
  post: "Shared an update",
  blog: "Published an article",
  deal: "Shared a deal opportunity",
};
