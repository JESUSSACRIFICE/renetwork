"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Heart,
  MessageSquare,
  Briefcase,
  FileText,
  Rss,
  Plus,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import {
  useNetworkFeed,
  useCreateNetworkPost,
  useLikePost,
  useUnlikePost,
  useUserLikedPost,
} from "@/hooks/use-networking";
import type { NetworkPostWithAuthor } from "@/lib/networking-types";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

const TYPE_LABELS = { post: "Post", blog: "Blog", deal: "Deal" };
const TYPE_ICONS = {
  post: Rss,
  blog: FileText,
  deal: Briefcase,
};

function FeedPostCard({
  post,
  onLike,
  onUnlike,
  isLiked,
  userId,
}: {
  post: NetworkPostWithAuthor;
  onLike: () => void;
  onUnlike: () => void;
  isLiked: boolean;
  userId: string | null;
}) {
  const Icon = TYPE_ICONS[post.type];
  const author = post.profiles;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-3">
          <Link href={`/profiles/${post.author_id}`}>
            <Avatar className="h-10 w-10">
              <AvatarImage src={author?.avatar_url ?? undefined} />
              <AvatarFallback>
                {author?.full_name?.charAt(0) ?? "?"}
              </AvatarFallback>
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
                {TYPE_LABELS[post.type]}
              </span>
              <span className="text-xs text-muted-foreground">
                · {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </span>
            </div>
            {post.title && (
              <h3 className="font-medium mt-1">{post.title}</h3>
            )}
            <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
              {post.content}
            </p>
            {post.type === "deal" && post.deal_details && Object.keys(post.deal_details).length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {(post.deal_details as Record<string, unknown>).location && (
                  <span className="text-xs bg-sky-100 text-sky-800 px-2 py-0.5 rounded">
                    {(post.deal_details as Record<string, unknown>).location as string}
                  </span>
                )}
                {(post.deal_details as Record<string, unknown>).property_type && (
                  <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                    {(post.deal_details as Record<string, unknown>).property_type as string}
                  </span>
                )}
              </div>
            )}
            <div className="flex gap-4 mt-3">
              <Button
                variant="ghost"
                size="sm"
                className="h-8"
                onClick={() => (isLiked ? onUnlike() : onLike())}
                disabled={!userId}
              >
                <Heart
                  className={`h-4 w-4 mr-1 ${isLiked ? "fill-red-500 text-red-500" : ""}`}
                />
                {post.like_count}
              </Button>
              <Link href={`/network/posts/${post.id}`}>
                <Button variant="ghost" size="sm" className="h-8">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  {post.comment_count}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function NetworkFeedPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<"all" | "post" | "blog" | "deal">("all");
  const { data: posts, isLoading } = useNetworkFeed(
    filter === "all" ? undefined : filter
  );
  const createPost = useCreateNetworkPost(user?.id ?? null);

  const [newPost, setNewPost] = useState<{
    type: "post" | "blog" | "deal";
    title: string;
    content: string;
  }>({ type: "post", title: "", content: "" });
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleCreate = () => {
    if (!newPost.content.trim()) {
      toast.error("Enter some content");
      return;
    }
    createPost.mutate(
      {
        type: newPost.type,
        title: newPost.title || undefined,
        content: newPost.content,
      },
      {
        onSuccess: () => {
          toast.success("Post created");
          setNewPost({ type: "post", title: "", content: "" });
          setDialogOpen(false);
        },
        onError: () => toast.error("Failed to post"),
      }
    );
  };

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Network Feed</h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={!user}>
                <Plus className="h-4 w-4 mr-2" />
                New post
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create post</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Select
                  value={newPost.type}
                  onValueChange={(v) =>
                    setNewPost((p) => ({ ...p, type: v as "post" | "blog" | "deal" }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="post">Post</SelectItem>
                    <SelectItem value="blog">Blog</SelectItem>
                    <SelectItem value="deal">Deal opportunity</SelectItem>
                  </SelectContent>
                </Select>
                {(newPost.type === "blog" || newPost.type === "deal") && (
                  <div>
                    <label className="text-sm font-medium">Title</label>
                    <input
                      value={newPost.title}
                      onChange={(e) =>
                        setNewPost((p) => ({ ...p, title: e.target.value }))
                      }
                      placeholder="Title"
                      className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                    />
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium">Content</label>
                  <Textarea
                    value={newPost.content}
                    onChange={(e) =>
                      setNewPost((p) => ({ ...p, content: e.target.value }))
                    }
                    placeholder="What's on your mind?"
                    className="mt-1 min-h-[120px]"
                  />
                </div>
                <Button
                  onClick={handleCreate}
                  disabled={createPost.isPending || !newPost.content.trim()}
                >
                  {createPost.isPending ? "Posting…" : "Post"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-2 mb-6">
          {(["all", "post", "blog", "deal"] as const).map((t) => (
            <Button
              key={t}
              variant={filter === t ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(t)}
            >
              {t === "all" ? "All" : TYPE_LABELS[t]}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="h-4 bg-muted rounded w-1/3 animate-pulse mb-3" />
                  <div className="h-20 bg-muted rounded animate-pulse" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !posts || posts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No posts yet.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Be the first to share!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCardWithLike key={post.id} post={post} userId={user?.id ?? null} />
            ))}
          </div>
        )}
    </div>
  );
}

function PostCardWithLike({
  post,
  userId,
}: {
  post: NetworkPostWithAuthor;
  userId: string | null;
}) {
  const likeMutation = useLikePost(post.id, userId);
  const unlikeMutation = useUnlikePost(post.id, userId);
  const { data: isLiked } = useUserLikedPost(post.id, userId);

  return (
    <FeedPostCard
      post={post}
      onLike={() => likeMutation.mutate()}
      onUnlike={() => unlikeMutation.mutate()}
      isLiked={!!isLiked}
      userId={userId}
    />
  );
}
