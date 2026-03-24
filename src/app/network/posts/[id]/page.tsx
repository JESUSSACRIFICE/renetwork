"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Heart, MessageSquare, ArrowLeft, Share2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  useNetworkPost,
  useNetworkPostComments,
  useNetworkFeedPreview,
  useUserLikedPost,
  useLikePost,
  useUnlikePost,
  useAddComment,
  useEditNetworkPost,
} from "@/hooks/use-networking";
import { useAuth } from "@/hooks/use-auth";
import { formatDistanceToNow } from "date-fns";
import {
  formatPostTimestamp,
  NETWORK_POST_ACTIVITY_LINE,
} from "@/lib/network-post-display";
import { NetworkPostImageGrid } from "@/components/network/NetworkPostImageGrid";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

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
  const editPost = useEditNetworkPost(id, user?.id ?? null);
  const [commentText, setCommentText] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const { data: feedPreview } = useNetworkFeedPreview(16);
  const relatedPosts = useMemo(() => {
    if (!feedPreview || !id) return [];
    return feedPreview.filter((p) => p.id !== id).slice(0, 3);
  }, [feedPreview, id]);

  const canEdit = !!user?.id && !!post && post.author_id === user.id;

  useEffect(() => {
    if (!canEdit || !post) return;
    setEditTitle(post.title ?? "");
    setEditContent(post.content ?? "");
  }, [canEdit, post]);

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

  const handleSaveEdit = () => {
    if (!canEdit || !post) return;
    const nextContent = editContent.trim();
    if (!nextContent) {
      toast.error("Post content cannot be empty");
      return;
    }
    const nextTitle = editTitle.trim();
    editPost.mutate(
      {
        title: nextTitle ? nextTitle : null,
        content: nextContent,
      },
      {
        onSuccess: () => {
          setEditOpen(false);
          toast.success("Post updated");
        },
        onError: () => toast.error("Failed to update post"),
      }
    );
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

  const author = post.profiles;
  const timeRelative = formatDistanceToNow(new Date(post.created_at), { addSuffix: true });

  const copyPostLink = () => {
    const url = `${window.location.origin}/network/posts/${post.id}`;
    void navigator.clipboard.writeText(url);
    toast.success("Link copied — paste anywhere to share");
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
        <Link
          href="/network/feed"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to feed
        </Link>

        <Card className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
          <CardContent className="p-0">
            <div className="flex gap-2.5 px-3 pt-3 sm:px-4 sm:pt-3.5">
              <div className="flex w-full items-start justify-between gap-2.5">
                <div className="flex gap-2.5 min-w-0">
                  <Link
                    href={`/profiles/${post.author_id}`}
                    className="shrink-0 self-start"
                  >
                    <Avatar className="h-10 w-10 border border-border/40">
                      <AvatarImage src={author?.avatar_url ?? undefined} />
                      <AvatarFallback className="text-sm font-semibold bg-muted">
                        {author?.full_name?.charAt(0) ?? "?"}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="min-w-0 flex-1 pb-2.5">
                    <Link
                      href={`/profiles/${post.author_id}`}
                      className="text-[15px] font-semibold text-primary hover:text-primary/90 hover:underline"
                    >
                      {author?.full_name ?? "Member"}
                    </Link>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[13px] text-muted-foreground">
                      <time
                        dateTime={post.created_at}
                        title={formatPostTimestamp(post.created_at)}
                      >
                        {timeRelative}
                      </time>
                      <span aria-hidden className="text-muted-foreground/60">
                        ·
                      </span>
                      <span>{NETWORK_POST_ACTIVITY_LINE[post.type]}</span>
                    </div>
                  </div>
                </div>

                {canEdit ? (
                  <div className="flex-shrink-0 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-full"
                      onClick={() => setEditOpen(true)}
                      disabled={editPost.isPending}
                    >
                      Edit post
                    </Button>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="px-3 pb-3 sm:px-4 sm:pb-3.5">
              {post.title && (
                <h1 className="text-[20px] font-semibold leading-snug text-foreground mb-2">
                  {post.title}
                </h1>
              )}
              {post.content.trim() ? (
                <div className="text-[15px] leading-relaxed text-foreground whitespace-pre-wrap">
                  {post.content}
                </div>
              ) : null}
              <NetworkPostImageGrid urls={post.image_urls} priority />
              {post.type === "deal" && post.deal_details && Object.keys(post.deal_details).length > 0 && (
                <div className="mt-3 rounded-lg bg-muted/40 p-3 border border-border/50">
                  <p className="text-sm font-semibold text-slate-700 mb-2">Deal details</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(post.deal_details as Record<string, unknown>).map(
                      ([k, v]) =>
                        v && (
                          <span
                            key={k}
                            className="rounded-lg bg-card px-2.5 py-1 text-sm text-foreground border border-border/60"
                          >
                            <span className="font-medium text-slate-500">{k}: </span>
                            {String(v)}
                          </span>
                        )
                    )}
                  </div>
                </div>
              )}
            </div>

            {(post.like_count > 0 || post.comment_count > 0) && (
              <div className="flex items-center justify-between border-t border-border/70 px-3 py-2 sm:px-4 text-[13px] text-muted-foreground">
                <div>
                  {post.like_count > 0 ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Heart className="h-3.5 w-3.5 fill-primary text-primary" />
                      <span>
                        {post.like_count} {post.like_count === 1 ? "like" : "likes"}
                      </span>
                    </span>
                  ) : null}
                </div>
                <div>
                  {post.comment_count > 0 ? (
                    <a href="#comments" className="hover:underline">
                      {post.comment_count} {post.comment_count === 1 ? "comment" : "comments"}
                    </a>
                  ) : null}
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 divide-x divide-border/80 border-t border-border/70 bg-muted/25">
              <Button
                type="button"
                variant="ghost"
                className="h-10 rounded-none text-[15px] font-medium text-muted-foreground hover:bg-muted/60"
                onClick={() => (isLiked ? unlikeMutation.mutate() : likeMutation.mutate())}
                disabled={!user}
              >
                <Heart
                  className={`mr-1.5 h-[18px] w-[18px] ${isLiked ? "fill-red-500 text-red-500" : "text-muted-foreground"}`}
                />
                Like
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="h-10 rounded-none text-[15px] font-medium text-muted-foreground hover:bg-muted/60"
                asChild
              >
                <a href="#comments">
                  <MessageSquare className="mr-1.5 h-[18px] w-[18px] text-muted-foreground" />
                  Comment
                </a>
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="h-10 rounded-none text-[15px] font-medium text-muted-foreground hover:bg-muted/60"
                onClick={copyPostLink}
              >
                <Share2 className="mr-1.5 h-[18px] w-[18px] text-muted-foreground" />
                Share
              </Button>
            </div>

          </CardContent>
        </Card>

        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader className="space-y-1 pb-2 border-b border-border/60">
              <DialogTitle className="text-lg font-semibold">Edit post</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Title (optional)</label>
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Title"
                  className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-[15px] shadow-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Content</label>
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="mt-1.5 min-h-[120px] resize-none border-0 bg-muted/50 text-[15px] leading-relaxed placeholder:text-muted-foreground/70 focus-visible:ring-1 focus-visible:ring-primary/25"
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <Button
                  type="button"
                  variant="secondary"
                  className="rounded-full"
                  onClick={() => setEditOpen(false)}
                  disabled={editPost.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="rounded-full"
                  onClick={handleSaveEdit}
                  disabled={editPost.isPending}
                >
                  {editPost.isPending ? "Saving…" : "Save changes"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {relatedPosts.length > 0 && (
          <div className="mt-6">
            <h3 className="text-[17px] font-semibold text-foreground mb-3">More from the network</h3>
            <div className="grid gap-3 sm:grid-cols-3">
              {relatedPosts.map((p) => {
                const snippet =
                  p.title?.trim() ||
                  (p.content.length > 72 ? `${p.content.slice(0, 72)}…` : p.content);
                return (
                  <Link key={p.id} href={`/network/posts/${p.id}`}>
                    <Card className="h-full rounded-xl border border-border/70 bg-card shadow-sm hover:border-primary/35 hover:shadow-md transition-all">
                      <CardContent className="p-4">
                        <p className="text-[13px] text-muted-foreground mb-1.5">
                          {NETWORK_POST_ACTIVITY_LINE[p.type]}
                        </p>
                        <p className="text-[15px] font-medium leading-snug text-foreground line-clamp-3">
                          {snippet}
                        </p>
                        <p className="text-[13px] text-primary font-medium mt-2.5">
                          {p.profiles?.full_name ?? "Member"}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        <div id="comments" className="mt-8 scroll-mt-28">
          <h3 className="text-[17px] font-semibold text-foreground mb-4">Comments</h3>
          {user && (
            <div className="mb-6 rounded-2xl border border-border/60 bg-muted/30 p-3">
              <Textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment…"
                className="min-h-[52px] resize-none border-0 bg-card shadow-sm rounded-xl text-[15px] leading-relaxed focus-visible:ring-1 focus-visible:ring-primary/25"
              />
              <div className="mt-2 flex justify-end">
                <Button
                  size="sm"
                  className="rounded-full px-5"
                  onClick={handleAddComment}
                  disabled={!commentText.trim() || addComment.isPending}
                >
                  {addComment.isPending ? "Posting…" : "Comment"}
                </Button>
              </div>
            </div>
          )}
          <div className="space-y-3">
            {comments?.map((c) => {
              const profile = (c as { profiles?: { full_name?: string; avatar_url?: string | null } })
                .profiles;
              return (
                <div key={c.id} className="flex gap-2">
                  <Avatar className="h-9 w-9 shrink-0 mt-0.5 border border-border/40">
                    <AvatarImage src={profile?.avatar_url ?? undefined} />
                    <AvatarFallback className="text-xs font-semibold bg-muted">
                      {profile?.full_name?.charAt(0) ?? "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="inline-block max-w-full rounded-2xl bg-muted/70 px-3 py-2">
                      <p className="text-[13px] font-semibold text-primary leading-none">
                        {profile?.full_name ?? "User"}
                      </p>
                      <p className="text-[15px] leading-relaxed text-foreground mt-1.5 whitespace-pre-wrap">
                        {c.content}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 ml-3">
                      {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              );
            })}
            {(!comments || comments.length === 0) && (
              <p className="text-sm text-muted-foreground py-2">
                Be the first to start the conversation.
              </p>
            )}
          </div>
        </div>
    </div>
  );
}
