"use client";

import { useState } from "react";
import AppHeader from "@/components/AppHeader";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Sparkles, ThumbsUp } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { AuthModal } from "@/components/auth/AuthModal";
import {
  useCommunityVoteItems,
  useUserVotedItemIds,
  useVoteItem,
  useRemoveVoteItem,
} from "@/hooks/use-community-votes";
import type { CommunityVoteItem } from "@/lib/community-vote-types";
import { toast } from "sonner";

function VoteCard({
  item,
  isVoted,
  onVote,
  onRemoveVote,
  isPending,
  user,
}: {
  item: CommunityVoteItem;
  isVoted: boolean;
  onVote: () => void;
  onRemoveVote: () => void;
  isPending: boolean;
  user: { id: string } | null;
}) {
  const handleClick = () => {
    if (!user) {
      toast.error("Sign in to vote");
      return;
    }
    if (isVoted) {
      onRemoveVote();
    } else {
      onVote();
    }
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 hover:border-primary/30">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg">{item.title}</CardTitle>
            {item.description && (
              <CardDescription className="mt-1 line-clamp-2">
                {item.description}
              </CardDescription>
            )}
          </div>
          <Button
            variant={isVoted ? "default" : "outline"}
            size="sm"
            onClick={handleClick}
            disabled={isPending}
            className="shrink-0"
          >
            <ThumbsUp
              className={`h-4 w-4 mr-1.5 ${isVoted ? "fill-current" : ""}`}
            />
            {item.vote_count}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <Button
          variant={isVoted ? "secondary" : "ghost"}
          size="sm"
          onClick={handleClick}
          disabled={isPending}
          className="w-full"
        >
          {isVoted ? "Remove vote" : "Vote for this"}
        </Button>
      </CardContent>
    </Card>
  );
}

function VoteList({
  items,
  votedIds,
  userId,
}: {
  items: CommunityVoteItem[];
  votedIds: Set<string>;
  userId: string | null;
}) {
  const voteMutation = useVoteItem(userId);
  const removeMutation = useRemoveVoteItem(userId);
  const isPending = voteMutation.isPending || removeMutation.isPending;

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item) => (
        <VoteCard
          key={item.id}
          item={item}
          isVoted={votedIds.has(item.id)}
          onVote={() =>
            voteMutation.mutate(item.id, {
              onSuccess: () => toast.success(`Voted for "${item.title}"`),
              onError: () => toast.error("Failed to vote"),
            })
          }
          onRemoveVote={() =>
            removeMutation.mutate(item.id, {
              onSuccess: () => toast.success("Vote removed"),
              onError: () => toast.error("Failed to remove vote"),
            })
          }
          isPending={isPending}
          user={userId ? { id: userId } : null}
        />
      ))}
    </div>
  );
}

export default function CommunityVotePage() {
  const { user } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"locations" | "features">("locations");

  const { data: locations = [], isLoading: locationsLoading } =
    useCommunityVoteItems("location");
  const { data: features = [], isLoading: featuresLoading } =
    useCommunityVoteItems("feature");
  const { data: votedIds = new Set<string>() } = useUserVotedItemIds(user?.id ?? null);

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold mb-3">
              Community-Driven: YOU Vote on What Gets Built
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Your voice matters. Vote on locations we should expand to and
              features you want to see next. Top-voted items get prioritized.
            </p>
          </div>

          {!user && (
            <Card className="mb-8 border-primary/30 bg-primary/5">
              <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <ThumbsUp className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Sign in to cast your vote</p>
                    <p className="text-sm text-muted-foreground">
                      Join the community and help shape the future of RE Network
                    </p>
                  </div>
                </div>
                <Button onClick={() => setAuthModalOpen(true)}>Sign In</Button>
              </CardContent>
            </Card>
          )}

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "locations" | "features")}>
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
              <TabsTrigger value="locations" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Locations
              </TabsTrigger>
              <TabsTrigger value="features" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Features
              </TabsTrigger>
            </TabsList>

            <TabsContent value="locations">
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-1">Vote on Locations</h2>
                  <p className="text-muted-foreground text-sm">
                    Which markets should we expand to next?
                  </p>
                </div>
                {locationsLoading ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <Card key={i} className="animate-pulse">
                        <CardHeader>
                          <div className="h-5 bg-muted rounded w-3/4" />
                          <div className="h-4 bg-muted rounded w-full mt-2" />
                        </CardHeader>
                        <CardContent>
                          <div className="h-9 bg-muted rounded" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : locations.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                      No locations to vote on yet. Check back soon!
                    </CardContent>
                  </Card>
                ) : (
                  <VoteList
                    items={locations}
                    votedIds={votedIds}
                    userId={user?.id ?? null}
                  />
                )}
              </div>
            </TabsContent>

            <TabsContent value="features">
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-1">Vote on Features</h2>
                  <p className="text-muted-foreground text-sm">
                    What features would you like to see next?
                  </p>
                </div>
                {featuresLoading ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <Card key={i} className="animate-pulse">
                        <CardHeader>
                          <div className="h-5 bg-muted rounded w-3/4" />
                          <div className="h-4 bg-muted rounded w-full mt-2" />
                        </CardHeader>
                        <CardContent>
                          <div className="h-9 bg-muted rounded" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : features.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                      No features to vote on yet. Check back soon!
                    </CardContent>
                  </Card>
                ) : (
                  <VoteList
                    items={features}
                    votedIds={votedIds}
                    userId={user?.id ?? null}
                  />
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </div>
  );
}
