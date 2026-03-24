"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Briefcase,
  ChevronRight,
  FileText,
  Rss,
  Search,
  Sparkles,
  UserCheck,
  UserPlus,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import {
  useNetworkActiveAuthors,
  useNetworkRecentHighlights,
  useFollowProfile,
  useProfileFollowStatus,
  useUnfollowProfile,
} from "@/hooks/use-networking";
import type { NetworkHighlightPost } from "@/lib/networking-types";

const TYPE_ICON = { post: Rss, blog: FileText, deal: Briefcase };

function highlightLabel(h: NetworkHighlightPost) {
  if (h.title?.trim()) return h.title;
  if (h.excerpt.trim()) return h.excerpt;
  if (h.image_urls.length > 0) return "Photo";
  return "Post";
}

function FollowButton({
  viewerId,
  profileId,
}: {
  viewerId: string;
  profileId: string;
}) {
  const { data: followStatus, isLoading } = useProfileFollowStatus(viewerId, profileId);
  const followMutation = useFollowProfile(profileId, viewerId);
  const unfollowMutation = useUnfollowProfile(profileId, viewerId);

  const isFollowing = !!followStatus?.isFollowing;
  const disabled = isLoading || followMutation.isPending || unfollowMutation.isPending;

  return (
    <Button
      size="sm"
      variant={isFollowing ? "secondary" : "outline"}
      className={`h-8 rounded-full text-xs w-full ${isFollowing ? "" : ""}`}
      disabled={disabled}
      onClick={() => {
        if (isFollowing) {
          unfollowMutation.mutate(undefined);
        } else {
          followMutation.mutate(undefined);
        }
      }}
      aria-label={isFollowing ? "Unfollow" : "Follow"}
      title={isFollowing ? "Following" : "Follow"}
    >
      {isFollowing ? (
        <span className="inline-flex items-center gap-2">
          <UserCheck className="h-3.5 w-3.5" />
          Following
        </span>
      ) : (
        <span className="inline-flex items-center gap-2">
          <UserPlus className="h-3.5 w-3.5" />
          Follow
        </span>
      )}
    </Button>
  );
}

export function NetworkLeftRail() {
  const { user } = useAuth();
  const { data: authors, isLoading: authLoading } = useNetworkActiveAuthors(
    user?.id ?? null,
    6
  );
  const { data: highlights, isLoading: hiLoading } = useNetworkRecentHighlights(4);

  const showPeople = authors?.slice(0, 4) ?? [];
  const showHighlights = highlights ?? [];

  return (
    <div className="space-y-4">
      <section className="rounded-3xl bg-white p-4 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">People to connect</h2>
          </div>
          <Link
            href="/search/profiles"
            className="text-xs font-medium text-primary hover:underline shrink-0"
          >
            See all
          </Link>
        </div>
        {authLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="h-11 w-11 rounded-full bg-muted" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-3 bg-muted rounded w-2/3" />
                  <div className="h-2 bg-muted rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : showPeople.length === 0 ? (
          <p className="text-xs text-muted-foreground leading-relaxed">
            When members post in the feed, suggested connections will appear here.
          </p>
        ) : (
          <ul className="space-y-3">
            {showPeople.map((a) => (
              <li key={a.id} className="flex gap-3">
                <Link href={`/profiles/${a.id}`} className="shrink-0">
                  <Avatar className="h-11 w-11 ring-2 ring-slate-50">
                    <AvatarImage src={a.avatar_url ?? undefined} alt="" />
                    <AvatarFallback>{a.full_name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Link>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/profiles/${a.id}`}
                    className="text-sm font-semibold hover:underline truncate block"
                  >
                    {a.full_name}
                  </Link>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                    {a.bio?.trim() || "Real estate network member"}
                  </p>
                  {user && user.id !== a.id ? (
                    <FollowButton viewerId={user.id} profileId={a.id} />
                  ) : null}
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2 h-8 rounded-full text-xs"
                    asChild
                  >
                    <Link href={`/profiles/${a.id}`}>View profile</Link>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-3xl bg-white p-4 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between gap-2 mb-3">
          <h2 className="text-sm font-semibold text-foreground">Recent activity</h2>
          <Link
            href="/network/feed"
            className="text-xs font-medium text-primary hover:underline shrink-0"
          >
            Feed
          </Link>
        </div>
        {hiLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse space-y-2">
                <div className="h-3 bg-muted rounded w-1/3" />
                <div className="h-10 bg-muted rounded-xl" />
              </div>
            ))}
          </div>
        ) : showHighlights.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No posts yet — start a thread from the feed.
          </p>
        ) : (
          <ul className="space-y-3">
            {showHighlights.map((h) => {
              const Icon = TYPE_ICON[h.type];
              return (
                <li key={h.id}>
                  <Link
                    href={`/network/posts/${h.id}`}
                    className="group flex gap-2.5 rounded-2xl border border-transparent bg-slate-50/80 px-3 py-2.5 transition-colors hover:border-primary/20 hover:bg-primary/5"
                  >
                    {h.image_urls[0] ? (
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-slate-200/80">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={h.image_urls[0]}
                          alt=""
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    ) : null}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-[10px] uppercase tracking-wide text-muted-foreground">
                        <Icon className="h-3 w-3" />
                        <span>{h.type}</span>
                        <span className="flex-1" />
                        <span>
                          {formatDistanceToNow(new Date(h.created_at), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-foreground mt-1 line-clamp-2 group-hover:text-primary">
                        {highlightLabel(h)}
                      </p>
                      {h.authorName && (
                        <p className="text-xs text-muted-foreground mt-1">{h.authorName}</p>
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

export function NetworkRightRail() {
  const router = useRouter();
  const { user } = useAuth();
  const [q, setQ] = useState("");
  const { data: authors, isLoading } = useNetworkActiveAuthors(user?.id ?? null, 12);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    if (!term) {
      router.push("/search/profiles");
      return;
    }
    router.push(`/search/profiles?fields=${encodeURIComponent(term)}`);
  };

  const contacts = authors?.slice(0, 8) ?? [];

  return (
    <div className="space-y-6">
      <form onSubmit={onSearch} className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search people & skills…"
          className="rounded-full border-slate-200 bg-slate-50/80 pl-9 h-11 shadow-none"
        />
      </form>

      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold">Quick contacts</h2>
          <Link
            href="/network/feed"
            className="text-muted-foreground hover:text-foreground"
            aria-label="Scroll feed"
          >
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        {isLoading ? (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col items-center gap-1 shrink-0 w-14 animate-pulse">
                <div className="h-12 w-12 rounded-full bg-muted" />
                <div className="h-2 w-10 bg-muted rounded" />
              </div>
            ))}
          </div>
        ) : contacts.length === 0 ? (
          <p className="text-xs text-muted-foreground">No members to show yet.</p>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
            {contacts.map((a) => (
              <Link
                key={a.id}
                href={`/profiles/${a.id}`}
                className="flex flex-col items-center gap-1 shrink-0 w-16 group"
              >
                <div className="relative">
                  <Avatar className="h-12 w-12 ring-2 ring-white shadow-sm group-hover:ring-primary/30 transition-all">
                    <AvatarImage src={a.avatar_url ?? undefined} alt="" />
                    <AvatarFallback>{a.full_name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span
                    className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white"
                    title="Recently active"
                  />
                </div>
                <span className="text-[11px] text-center text-muted-foreground truncate w-full">
                  {a.full_name.split(" ")[0]}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-slate-100 bg-slate-50/50 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">Recently active</h2>
        </div>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="h-10 w-10 rounded-full bg-muted" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="h-2 bg-muted rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : contacts.length === 0 ? (
          <p className="text-xs text-muted-foreground">Invite your team to grow the network.</p>
        ) : (
          <ul className="space-y-3">
            {contacts.slice(0, 6).map((a) => (
              <li key={a.id}>
                <Link
                  href={`/profiles/${a.id}`}
                  className="group flex items-center gap-3 rounded-xl p-1.5 -mx-1.5 hover:bg-white transition-colors"
                >
                  <div className="relative shrink-0">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={a.avatar_url ?? undefined} alt="" />
                      <AvatarFallback>{a.full_name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-slate-50" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{a.full_name}</p>
                    <p className="text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        Active{" "}
                        {formatDistanceToNow(new Date(a.lastActiveAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-3xl border border-dashed border-slate-200 bg-white/60 p-4 text-center">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Explore professionals, agencies, and services across the platform.
        </p>
        <Button variant="secondary" size="sm" className="mt-3 rounded-full" asChild>
          <Link href="/search/profiles">Open Explore</Link>
        </Button>
      </section>
    </div>
  );
}
