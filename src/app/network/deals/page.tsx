"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Briefcase, MapPin, ArrowRight, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useNetworkFeed } from "@/hooks/use-networking";
import { formatDistanceToNow } from "date-fns";

export default function NetworkDealsPage() {
  const { data: posts, isLoading, dataUpdatedAt } = useNetworkFeed("deal", {
    refetchInterval: 90_000,
  });

  const dealStats = useMemo(() => {
    if (!posts?.length) return { count: 0, newestLabel: null as string | null };
    const newest = posts[0];
    return {
      count: posts.length,
      newestLabel: formatDistanceToNow(new Date(newest.created_at), {
        addSuffix: true,
      }),
    };
  }, [posts]);

  const updatedLabel = useMemo(() => {
    if (!dataUpdatedAt) return null;
    return formatDistanceToNow(new Date(dataUpdatedAt), { addSuffix: true });
  }, [dataUpdatedAt]);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
        <div className="rounded-3xl border border-slate-100 bg-gradient-to-br from-sky-50/80 via-white to-emerald-50/50 p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Deal opportunities</h1>
              <p className="text-muted-foreground mt-1 max-w-2xl">
                JV partnerships, off-market deals, and investment opportunities from the community.
              </p>
            </div>
            {!isLoading && posts && posts.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-end">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-slate-100 px-3 py-1.5 text-sm font-medium shadow-sm">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                  {dealStats.count} open
                </span>
                {dealStats.newestLabel && (
                  <span className="inline-flex items-center rounded-full bg-white/80 px-3 py-1.5 text-xs text-muted-foreground border border-slate-100">
                    Latest {dealStats.newestLabel}
                  </span>
                )}
                {updatedLabel && (
                  <span className="inline-flex items-center rounded-full bg-slate-50 px-3 py-1.5 text-xs text-muted-foreground">
                    Refreshed {updatedLabel}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="rounded-3xl border-slate-100">
                <CardContent className="p-6">
                  <div className="h-5 bg-muted rounded w-2/3 animate-pulse mb-3" />
                  <div className="h-16 bg-muted rounded animate-pulse" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !posts || posts.length === 0 ? (
          <Card className="rounded-3xl border-dashed border-slate-200">
            <CardContent className="py-16 text-center">
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No deal opportunities yet.</p>
              <Link href="/network/feed" className="text-primary hover:underline mt-2 inline-block">
                Create a deal post
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {posts.map((post) => (
              <Link key={post.id} href={`/network/posts/${post.id}`}>
                <Card className="hover:shadow-lg transition-shadow h-full rounded-3xl border-slate-100">
                  <CardContent className="p-6">
                    <h3 className="font-semibold line-clamp-2">{post.title || post.content.slice(0, 60)}</h3>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {post.content}
                    </p>
                    {post.deal_details && Object.keys(post.deal_details).length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {(post.deal_details as Record<string, unknown>).location && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {(post.deal_details as Record<string, unknown>).location as string}
                          </span>
                        )}
                        {(post.deal_details as Record<string, unknown>).property_type && (
                          <span className="text-xs bg-slate-100 px-2 py-0.5 rounded">
                            {(post.deal_details as Record<string, unknown>).property_type as string}
                          </span>
                        )}
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
                      <span>{post.profiles?.full_name ?? "User"}</span>
                      <span className="flex items-center gap-1">
                        {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
    </div>
  );
}
