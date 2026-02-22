"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Heart, MessageSquare, Briefcase, FileText, Rss, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  useNetworkPost,
  useNetworkPostComments,
  useUserLikedPost,
  useLikePost,
  useUnlikePost,
  useAddComment,
} from "@/hooks/use-networking";
import { useAuth } from "@/hooks/use-auth";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";

const TYPE_ICONS = { post: Rss, blog: FileText, deal: Briefcase };

export default function NetworkPostDetailPage() {
  const params = useParams();
  const id = (params?.id as string) ?? null;
  const { user } = useAuth();
  const { data: post, isLoading } = useNetworkPost(id);
  const { data: comments } = useNetworkPostComments(id);
  const { data: isLiked } = useUserLikedPost(id, user?.id ?? null);
  const likeMutation = useLikePost(id, user?.id ?? null);
  const unlikeMutation = useUnlikePost(id, user?.id ?? null);
  const addComment = useAddComment(id, user?.id ?? null);
  const [commentText, setCommentText] = useState("");

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    addComment.mutate(commentText, {
      onSuccess: () => {
        setCommentText("");
        toast.success("Comment added");
      },
      onError: () => toast.error("Failed to add comment"),
    });
  };

  if (isLoading || !id) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Post not found</h2>
          <Link href="/network/feed" className="text-primary hover:underline mt-2">
            Back to feed
          </Link>
        </div>
      </div>
    );
  }

  const Icon = TYPE_ICONS[post.type];
  const author = post.profiles;

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
        <Link
          href="/network/feed"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to feed
        </Link>

        <Card>
          <CardContent className="p-6">
            <div className="flex gap-3">
              <Link href={`/profiles/${post.author_id}`}>
                <Avatar className="h-12 w-12">
                  <AvatarImage src={author?.avatar_url ?? undefined} />
                  <AvatarFallback>{author?.full_name?.charAt(0) ?? "?"}</AvatarFallback>
                </Avatar>
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    href={`/profiles/${post.author_id}`}
                    className="font-semibold hover:underline"
                  >
                    {author?.full_name ?? "User"}
                  </Link>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Icon className="h-3 w-3" />
                    {post.type}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    · {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                  </span>
                </div>
                {post.title && (
                  <h1 className="text-xl font-semibold mt-2">{post.title}</h1>
                )}
                <p className="text-muted-foreground mt-2 whitespace-pre-wrap">
                  {post.content}
                </p>
                {post.type === "deal" && post.deal_details && Object.keys(post.deal_details).length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="text-sm font-medium">Deal details:</span>
                    {Object.entries(post.deal_details as Record<string, unknown>).map(
                      ([k, v]) =>
                        v && (
                          <span
                            key={k}
                            className="text-xs bg-sky-100 text-sky-800 px-2 py-1 rounded"
                          >
                            {k}: {String(v)}
                          </span>
                        )
                    )}
                  </div>
                )}
                <div className="flex gap-4 mt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => (isLiked ? unlikeMutation.mutate() : likeMutation.mutate())}
                    disabled={!user}
                  >
                    <Heart
                      className={`h-4 w-4 mr-1 ${isLiked ? "fill-red-500 text-red-500" : ""}`}
                    />
                    {post.like_count}
                  </Button>
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MessageSquare className="h-4 w-4" />
                    {post.comment_count} comments
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6">
          <h3 className="font-semibold mb-4">Comments</h3>
          {user && (
            <div className="flex gap-2 mb-6">
              <Textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="min-h-[80px]"
              />
              <Button
                onClick={handleAddComment}
                disabled={!commentText.trim() || addComment.isPending}
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
            </div>
          )}
          <div className="space-y-4">
            {comments?.map((c) => (
              <Card key={c.id}>
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {(c as { profiles?: { full_name?: string } }).profiles?.full_name?.charAt(0) ?? "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">
                        {(c as { profiles?: { full_name?: string } }).profiles?.full_name ?? "User"}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                        {c.content}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {(!comments || comments.length === 0) && (
              <p className="text-sm text-muted-foreground">No comments yet.</p>
            )}
          </div>
        </div>
    </div>
  );
}
