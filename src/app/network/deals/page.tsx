"use client";

import Link from "next/link";
import { Briefcase, MapPin, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useNetworkFeed } from "@/hooks/use-networking";
import type { NetworkPostWithAuthor } from "@/lib/networking-types";
import { formatDistanceToNow } from "date-fns";

export default function NetworkDealsPage() {
  const { data: posts, isLoading } = useNetworkFeed("deal");

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Deal Opportunities</h1>
          <p className="text-muted-foreground mt-1">
            JV partnerships, off-market deals, and investment opportunities from the community
          </p>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="h-5 bg-muted rounded w-2/3 animate-pulse mb-3" />
                  <div className="h-16 bg-muted rounded animate-pulse" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !posts || posts.length === 0 ? (
          <Card>
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
                <Card className="hover:shadow-lg transition-shadow h-full">
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
