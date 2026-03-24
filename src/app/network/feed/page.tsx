"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, ImageIcon, MessageSquare, Plus, Share2, X } from "lucide-react";
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
  useSavedProfileFolders,
  useSavedFolderProfiles,
  useCreateSavedProfileFolder,
  useRenameSavedProfileFolder,
  useSaveProfileToFolder,
  useRemoveProfileFromFolder,
} from "@/hooks/use-networking";
import type { NetworkPostWithAuthor } from "@/lib/networking-types";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import {
  formatPostTimestamp,
  NETWORK_POST_ACTIVITY_LINE,
} from "@/lib/network-post-display";
import {
  uploadNetworkPostImages,
  validateNetworkPostImageFile,
  getNetworkFeedPostSaveErrorMessage,
} from "@/lib/network-post-images";
import { NetworkPostImageGrid } from "@/components/network/NetworkPostImageGrid";
import { cn } from "@/lib/utils";

const TYPE_LABELS = {
  post: "Post",
  blog: "Blog",
  deal: "Deal",
  folders: "Folders",
};
const DEFAULT_SAVED_PROFILE_FOLDERS = ["Think Tank", "Master Mind"] as const;
const FEED_WELCOME_BANNER_KEY = "ren-network-feed-welcome-dismissed";

function isSavedFolderDuplicateError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  return (
    message.includes("duplicate key") ||
    message.includes("already exists") ||
    message.includes("unique constraint")
  );
}

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
  const router = useRouter();
  const author = post.profiles;
  const timeLabel = formatPostTimestamp(post.created_at);
  const relativeHint = formatDistanceToNow(new Date(post.created_at), {
    addSuffix: true,
  });

  const copyPostLink = () => {
    const url = `${window.location.origin}/network/posts/${post.id}`;
    void navigator.clipboard.writeText(url);
    toast.success("Link copied — paste anywhere to share");
  };

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={() => router.push(`/network/posts/${post.id}`)}
      onKeyDown={(e) => {
        if (e.key !== "Enter" && e.key !== " ") return;
        e.preventDefault();
        router.push(`/network/posts/${post.id}`);
      }}
      className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm cursor-pointer hover:border-primary/35 hover:shadow-md transition-all"
    >
      <CardContent className="p-0">
        <div className="flex gap-2.5 px-3 pt-3 sm:px-4 sm:pt-3.5">
          <Link
            href={`/profiles/${post.author_id}`}
            className="shrink-0 self-start"
            onClick={(e) => e.stopPropagation()}
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
              onClick={(e) => e.stopPropagation()}
            >
              {author?.full_name ?? "Member"}
            </Link>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[13px] text-muted-foreground">
              <time dateTime={post.created_at} title={timeLabel}>
                {relativeHint}
              </time>
              <span aria-hidden className="text-muted-foreground/60">
                ·
              </span>
              <span>{NETWORK_POST_ACTIVITY_LINE[post.type]}</span>
            </div>
          </div>
        </div>

        <div className="px-3 pb-3 sm:px-4 sm:pb-3.5">
          {post.title && (
            <h3 className="text-[17px] font-semibold leading-snug text-foreground mb-1.5">
              {post.title}
            </h3>
          )}
          {post.content.trim() ? (
            <div className="text-[15px] leading-relaxed text-foreground whitespace-pre-wrap">
              {post.content}
            </div>
          ) : null}
          <NetworkPostImageGrid urls={post.image_urls} />
          {post.type === "deal" &&
            post.deal_details &&
            Object.keys(post.deal_details).length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2 rounded-lg bg-muted/40 p-3 border border-border/50">
                {(post.deal_details as Record<string, unknown>).location && (
                  <span className="inline-flex items-center text-sm text-foreground">
                    <span className="font-medium text-muted-foreground mr-1.5">
                      Location
                    </span>
                    {
                      (post.deal_details as Record<string, unknown>)
                        .location as string
                    }
                  </span>
                )}
                {(post.deal_details as Record<string, unknown>)
                  .property_type && (
                  <span className="inline-flex rounded-lg bg-card px-2.5 py-1 text-sm text-foreground border border-border/60">
                    {
                      (post.deal_details as Record<string, unknown>)
                        .property_type as string
                    }
                  </span>
                )}
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
                <Link
                  href={`/network/posts/${post.id}#comments`}
                  className="hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  {post.comment_count}{" "}
                  {post.comment_count === 1 ? "comment" : "comments"}
                </Link>
              ) : null}
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 divide-x divide-border/80 border-t border-border/70 bg-muted/25">
          <Button
            type="button"
            variant="ghost"
            className="h-10 rounded-none text-[15px] font-medium text-muted-foreground hover:bg-muted/60"
            onClick={(e) => {
              e.stopPropagation();
              isLiked ? onUnlike() : onLike();
            }}
            disabled={!userId}
          >
            <Heart
              className={`mr-1.5 h-[18px] w-[18px] ${isLiked ? "fill-red-500 text-red-500" : "text-muted-foreground"}`}
            />
            Like
          </Button>
          <Button
            variant="ghost"
            className="h-10 rounded-none text-[15px] font-medium text-muted-foreground hover:bg-muted/60"
            asChild
          >
            <Link
              href={`/network/posts/${post.id}#comments`}
              onClick={(e) => e.stopPropagation()}
            >
              <MessageSquare className="mr-1.5 h-[18px] w-[18px] text-muted-foreground" />
              Comment
            </Link>
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="h-10 rounded-none text-[15px] font-medium text-muted-foreground hover:bg-muted/60"
            onClick={(e) => {
              e.stopPropagation();
              copyPostLink();
            }}
          >
            <Share2 className="mr-1.5 h-[18px] w-[18px] text-muted-foreground" />
            Share
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function NetworkFeedPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<
    "all" | "post" | "blog" | "deal" | "folders"
  >("all");
  const {
    data: posts,
    isLoading,
    dataUpdatedAt,
  } = useNetworkFeed(
    filter === "all" || filter === "folders" ? undefined : filter,
    { refetchInterval: 60_000 },
  );
  const createPost = useCreateNetworkPost(user?.id ?? null);
  const { data: folders = [], isFetched: areFoldersFetched } =
    useSavedProfileFolders(user?.id ?? null);
  const { data: savedProfiles = [] } = useSavedFolderProfiles(user?.id ?? null);
  const createFolder = useCreateSavedProfileFolder(user?.id ?? null);
  const renameFolder = useRenameSavedProfileFolder(user?.id ?? null);
  const saveProfileToFolder = useSaveProfileToFolder(user?.id ?? null);
  const removeProfileFromFolder = useRemoveProfileFromFolder(user?.id ?? null);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const firstName =
    (
      user?.user_metadata as { full_name?: string } | undefined
    )?.full_name?.split(" ")?.[0] ??
    user?.email?.split("@")[0] ??
    "";

  const feedStats = useMemo(() => {
    if (!posts?.length) return null;
    const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const last24h = posts.filter(
      (p) => new Date(p.created_at).getTime() > dayAgo,
    ).length;
    return {
      last24h,
      deals: posts.filter((p) => p.type === "deal").length,
      blogs: posts.filter((p) => p.type === "blog").length,
      posts: posts.filter((p) => p.type === "post").length,
    };
  }, [posts]);

  const lastUpdatedLabel = useMemo(() => {
    if (!dataUpdatedAt) return null;
    return formatDistanceToNow(new Date(dataUpdatedAt), { addSuffix: true });
  }, [dataUpdatedAt]);

  const [newPost, setNewPost] = useState<{
    type: "post" | "blog" | "deal";
    title: string;
    content: string;
  }>({ type: "post", title: "", content: "" });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const previewUrls = useMemo(
    () => pendingFiles.map((f) => URL.createObjectURL(f)),
    [pendingFiles],
  );
  useEffect(() => {
    return () => previewUrls.forEach((u) => URL.revokeObjectURL(u));
  }, [previewUrls]);

  const [welcomeBannerVisible, setWelcomeBannerVisible] = useState(true);
  const [newFolderName, setNewFolderName] = useState("");
  const [renameDrafts, setRenameDrafts] = useState<Record<string, string>>({});
  const [selectedFolderByProfile, setSelectedFolderByProfile] = useState<
    Record<string, string>
  >({});
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const defaultFoldersSeededForUser = useRef<string | null>(null);

  useEffect(() => {
    if (!user?.id || defaultFoldersSeededForUser.current === user.id) return;
    if (!areFoldersFetched) return;

    const existingNames = new Set(
      folders.map((folder) => folder.name.trim().toLowerCase()),
    );
    const missingDefaults = DEFAULT_SAVED_PROFILE_FOLDERS.filter(
      (name) => !existingNames.has(name.toLowerCase()),
    );
    if (missingDefaults.length === 0) {
      defaultFoldersSeededForUser.current = user.id;
      return;
    }

    let cancelled = false;
    void (async () => {
      for (const name of missingDefaults) {
        if (cancelled) return;
        try {
          await createFolder.mutateAsync(name);
        } catch (error) {
          // Ignore duplicate errors in case another client created it first.
          if (!isSavedFolderDuplicateError(error)) return;
        }
      }
      if (!cancelled) defaultFoldersSeededForUser.current = user.id;
    })();

    return () => {
      cancelled = true;
    };
  }, [areFoldersFetched, createFolder, folders, user?.id]);

  useEffect(() => {
    try {
      if (localStorage.getItem(FEED_WELCOME_BANNER_KEY) === "1") {
        setWelcomeBannerVisible(false);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const dismissWelcomeBanner = () => {
    setWelcomeBannerVisible(false);
    try {
      localStorage.setItem(FEED_WELCOME_BANNER_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  const feedAuthors = useMemo(() => {
    if (!posts?.length) return [];
    const seen = new Set<string>();
    const next: Array<{
      id: string;
      full_name: string | null;
      avatar_url: string | null;
      bio: string | null;
    }> = [];
    for (const p of posts) {
      const a = p.profiles;
      if (!a?.id || seen.has(a.id)) continue;
      seen.add(a.id);
      next.push({
        id: a.id,
        full_name: a.full_name ?? null,
        avatar_url: a.avatar_url ?? null,
        bio: null,
      });
    }
    return next;
  }, [posts]);

  const commitFolderRename = (folderId: string, fallbackName: string) => {
    const nextName = (renameDrafts[folderId] ?? fallbackName).trim();
    if (!nextName || nextName === fallbackName) {
      setEditingFolderId(null);
      return;
    }
    renameFolder.mutate(
      { folderId, name: nextName },
      {
        onSuccess: () => {
          toast.success("Folder renamed");
          setEditingFolderId(null);
        },
        onError: () => toast.error("Failed to rename folder"),
      },
    );
  };

  const handleCreate = async () => {
    if (!newPost.content.trim() && pendingFiles.length === 0) {
      toast.error("Add some text or at least one photo");
      return;
    }
    if (!user?.id) return;
    setIsPosting(true);
    try {
      let imageUrls: string[] = [];
      if (pendingFiles.length > 0) {
        imageUrls = await uploadNetworkPostImages(user.id, pendingFiles);
      }
      await createPost.mutateAsync({
        type: newPost.type,
        title: newPost.title || undefined,
        content: newPost.content.trim() || " ",
        image_urls: imageUrls,
      });
      toast.success("Post created");
      setNewPost({ type: "post", title: "", content: "" });
      setPendingFiles([]);
      setDialogOpen(false);
    } catch (e) {
      toast.error(getNetworkFeedPostSaveErrorMessage(e));
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {welcomeBannerVisible ? (
        <div className="relative rounded-3xl border border-slate-100 bg-gradient-to-br from-primary/10 via-white to-sky-50/50 p-5 pt-5 pr-12 shadow-sm">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 h-9 w-9 shrink-0 rounded-full text-muted-foreground hover:bg-white/80 hover:text-foreground"
            onClick={dismissWelcomeBanner}
            aria-label="Dismiss welcome banner"
          >
            <X className="h-4 w-4" />
          </Button>
          <p className="text-sm text-muted-foreground">
            {greeting}
            {firstName ? `, ${firstName}` : ""}
          </p>
          <h1 className="text-2xl font-bold tracking-tight mt-1">
            Your network feed
          </h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-lg">
            See what investors and partners are sharing — posts refresh
            automatically so you stay current.
          </p>
          {feedStats && filter === "all" && (
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="inline-flex items-center rounded-full bg-white/90 border border-slate-100 px-3 py-1 text-xs font-medium text-foreground shadow-sm">
                {feedStats.last24h} new (24h)
              </span>
              <span className="inline-flex items-center rounded-full bg-white/90 border border-slate-100 px-3 py-1 text-xs text-muted-foreground shadow-sm">
                {feedStats.deals} deals · {feedStats.blogs} blogs ·{" "}
                {feedStats.posts} updates
              </span>
              {lastUpdatedLabel && (
                <span className="inline-flex items-center rounded-full bg-white/60 px-3 py-1 text-xs text-muted-foreground">
                  Updated {lastUpdatedLabel}
                </span>
              )}
            </div>
          )}
          {filter !== "all" && (
            <p className="text-xs text-muted-foreground mt-3">
              Showing{" "}
              <span className="font-medium text-foreground">
                {TYPE_LABELS[filter]}
              </span>{" "}
              only — switch to All for full activity.
            </p>
          )}
          <div className="flex flex-wrap gap-3 mt-4">
            <Link
              href="/network/deals"
              className="text-sm font-medium text-primary hover:underline"
            >
              Browse deal opportunities
            </Link>
            <Link
              href="/community"
              className="text-sm font-medium text-primary hover:underline"
            >
              Groups & forums
            </Link>
          </div>
        </div>
      ) : null}

      <div className="flex justify-between items-center gap-4">
        <h2 className="text-[17px] font-semibold text-foreground">
          Latest updates
        </h2>
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) setPendingFiles([]);
          }}
        >
          <DialogTrigger asChild>
            <Button
              disabled={!user}
              className="rounded-lg font-medium shadow-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              New post
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader className="space-y-1 pb-2 border-b border-border/60">
              <DialogTitle className="text-lg font-semibold">
                Create post
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <Select
                value={newPost.type}
                onValueChange={(v) =>
                  setNewPost((p) => ({
                    ...p,
                    type: v as "post" | "blog" | "deal",
                  }))
                }
              >
                <SelectTrigger className="rounded-xl h-11">
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
                    className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-[15px] shadow-sm"
                  />
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Content
                </label>
                <Textarea
                  value={newPost.content}
                  onChange={(e) =>
                    setNewPost((p) => ({ ...p, content: e.target.value }))
                  }
                  placeholder="What's on your mind?"
                  className="mt-1.5 min-h-[120px] rounded-2xl border-0 bg-muted/50 text-[15px] leading-relaxed placeholder:text-muted-foreground/70 focus-visible:ring-1 focus-visible:ring-primary/25"
                />
              </div>
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  multiple
                  className="sr-only"
                  aria-hidden
                  onChange={(e) => {
                    const files = e.target.files;
                    if (!files?.length) return;
                    setPendingFiles((prev) => {
                      const next = [...prev];
                      for (let i = 0; i < files.length; i++) {
                        if (next.length >= 6) break;
                        const f = files[i];
                        const err = validateNetworkPostImageFile(f);
                        if (err) {
                          toast.error(err);
                          continue;
                        }
                        next.push(f);
                      }
                      return next;
                    });
                    e.target.value = "";
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Add photos
                </Button>
                <p className="text-xs text-muted-foreground mt-1">
                  Up to 6 images, 5MB each (JPEG, PNG, WebP, GIF).
                </p>
                {previewUrls.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {previewUrls.map((src, i) => (
                      <div
                        key={src}
                        className="relative aspect-square overflow-hidden rounded-lg border bg-muted"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={src}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                          aria-label="Remove photo"
                          onClick={() =>
                            setPendingFiles((p) =>
                              p.filter((_, idx) => idx !== i),
                            )
                          }
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <Button
                className="w-full rounded-lg font-semibold sm:w-auto"
                onClick={() => void handleCreate()}
                disabled={
                  isPosting ||
                  createPost.isPending ||
                  (!newPost.content.trim() && pendingFiles.length === 0)
                }
              >
                {isPosting || createPost.isPending ? "Posting…" : "Post"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2 flex-wrap">
        {(["all", "post", "blog", "deal", "folders"] as const).map((t) => (
          <Button
            key={t}
            variant={filter === t ? "default" : "secondary"}
            size="sm"
            className={cn(
              "rounded-full px-4 font-medium shadow-none",
              filter !== t && "bg-muted/70 text-foreground hover:bg-muted",
            )}
            onClick={() => setFilter(t)}
          >
            {t === "all" ? "All" : TYPE_LABELS[t]}
          </Button>
        ))}
      </div>

      {filter === "folders" ? (
        <div className="space-y-4">
          {!user ? (
            <Card className="rounded-xl border border-dashed border-border/80 bg-card/80 shadow-sm">
              <CardContent className="py-10 text-center">
                <p className="text-[15px] font-medium text-foreground">
                  Sign in to manage folders
                </p>
                <p className="text-sm text-muted-foreground mt-1.5">
                  Save profiles and organize them by folder.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card className="rounded-xl border-border/70 shadow-sm">
                <CardContent className="p-4">
                  <p className="text-sm font-semibold text-foreground mb-3">
                    Create folder
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <input
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      placeholder="e.g. JV Partners"
                      className="h-10 flex-1 min-w-[220px] rounded-xl border border-input bg-background px-3 text-sm"
                    />
                    <Button
                      type="button"
                      className="rounded-full"
                      disabled={createFolder.isPending || !newFolderName.trim()}
                      onClick={() => {
                        createFolder.mutate(newFolderName, {
                          onSuccess: () => {
                            toast.success("Folder created");
                            setNewFolderName("");
                          },
                          onError: (e) =>
                            toast.error(
                              e instanceof Error
                                ? e.message
                                : "Failed to create folder",
                            ),
                        });
                      }}
                    >
                      Add folder
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-xl border-border/70 shadow-sm">
                <CardContent className="p-4 space-y-4">
                  <p className="text-sm font-semibold text-foreground">
                    Save people from feed
                  </p>
                  {feedAuthors.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No authors yet. As people post in the feed, you can save
                      them here.
                    </p>
                  ) : folders.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Create a folder first, then save profiles into it.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {feedAuthors.map((a) => (
                        <div
                          key={a.id}
                          className="flex flex-col gap-2 rounded-lg border border-border/60 p-3 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <Link
                            href={`/profiles/${a.id}`}
                            className="inline-flex items-center gap-2.5 min-w-0"
                          >
                            <Avatar className="h-8 w-8 border border-border/50">
                              <AvatarImage src={a.avatar_url ?? undefined} />
                              <AvatarFallback className="text-xs font-semibold bg-muted">
                                {(a.full_name ?? "Member").charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium hover:underline truncate">
                              {a.full_name ?? "Member"}
                            </span>
                          </Link>
                          <div className="flex gap-2">
                            <Select
                              value={
                                selectedFolderByProfile[a.id] ?? folders[0]?.id
                              }
                              onValueChange={(v) =>
                                setSelectedFolderByProfile((p) => ({
                                  ...p,
                                  [a.id]: v,
                                }))
                              }
                            >
                              <SelectTrigger className="h-9 w-[180px] rounded-lg">
                                <SelectValue placeholder="Select folder" />
                              </SelectTrigger>
                              <SelectContent>
                                {folders.map((f) => (
                                  <SelectItem key={f.id} value={f.id}>
                                    {f.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              type="button"
                              size="sm"
                              className="rounded-full"
                              onClick={() => {
                                const folderId =
                                  selectedFolderByProfile[a.id] ??
                                  folders[0]?.id;
                                if (!folderId) return;
                                saveProfileToFolder.mutate(
                                  { profileId: a.id, folderId },
                                  {
                                    onSuccess: () =>
                                      toast.success("Profile saved"),
                                    onError: () =>
                                      toast.error("Failed to save profile"),
                                  },
                                );
                              }}
                            >
                              Save
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {folders.length === 0 ? (
                <Card className="rounded-xl border border-dashed border-border/80 bg-card/80 shadow-sm">
                  <CardContent className="py-10 text-center">
                    <p className="text-[15px] font-medium text-foreground">
                      No folders yet
                    </p>
                    <p className="text-sm text-muted-foreground mt-1.5">
                      Create your first folder to organize saved profiles.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {folders.map((folder) => {
                    const items = savedProfiles.filter(
                      (s) => s.folder_id === folder.id,
                    );
                    return (
                      <Card
                        key={folder.id}
                        className="rounded-xl border-0 shadow-none h-full overflow-hidden bg-transparent"
                      >
                        <CardContent className="p-4 h-full flex flex-col items-center justify-start">
                          <div className="mb-3 w-full max-w-[150px]">
                            <div className="h-2.5 w-14 rounded-t-md bg-amber-300/70 border border-amber-400/40 border-b-0" />
                            <div className="rounded-xl rounded-tl-none border border-amber-300/70 bg-gradient-to-br from-amber-50/90 to-yellow-100/50 p-3 min-h-[220px]">
                              {items.length === 0 ? (
                                <div className="h-full rounded-md border border-dashed border-amber-400/40 bg-amber-100/20 px-2 py-4 text-center text-xs text-muted-foreground flex items-center justify-center">
                                  Empty folder
                                </div>
                              ) : (
                                <div className="relative h-full min-h-[180px]">
                                  {items.slice(0, 4).map((item, idx) => (
                                    <div
                                      key={`preview-${item.id}`}
                                      className="absolute inset-0 overflow-hidden rounded-md border border-amber-200/70 bg-amber-100/30 shadow-sm"
                                      style={{
                                        transform: `translateX(${idx * 7}px) translateY(${idx * 9}px) scale(${1 - idx * 0.06}) rotate(${idx * 1.2}deg)`,
                                        zIndex: 40 - idx,
                                        opacity: 1 - idx * 0.12,
                                      }}
                                    >
                                      {item.profile?.avatar_url ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                          src={item.profile.avatar_url}
                                          alt={item.profile?.full_name ?? "Member"}
                                          className="h-full w-full object-cover"
                                        />
                                      ) : (
                                        <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-muted-foreground">
                                          {(item.profile?.full_name ?? "M").charAt(0)}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="w-full max-w-[220px] text-center">
                            <div className="min-w-0">
                              {editingFolderId === folder.id ? (
                                <input
                                  value={renameDrafts[folder.id] ?? folder.name}
                                  onChange={(e) =>
                                    setRenameDrafts((p) => ({
                                      ...p,
                                      [folder.id]: e.target.value,
                                    }))
                                  }
                                  onBlur={() =>
                                    commitFolderRename(folder.id, folder.name)
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      commitFolderRename(
                                        folder.id,
                                        folder.name,
                                      );
                                    } else if (e.key === "Escape") {
                                      e.preventDefault();
                                      setRenameDrafts((p) => ({
                                        ...p,
                                        [folder.id]: folder.name,
                                      }));
                                      setEditingFolderId(null);
                                    }
                                  }}
                                  autoFocus
                                  className="h-9 w-full max-w-full rounded-lg border border-input bg-background px-3 text-sm text-center"
                                />
                              ) : (
                                <button
                                  type="button"
                                  className="w-full text-sm font-semibold text-foreground hover:underline truncate text-center"
                                  onClick={() => {
                                    setRenameDrafts((p) => ({
                                      ...p,
                                      [folder.id]: folder.name,
                                    }));
                                    setEditingFolderId(folder.id);
                                  }}
                                >
                                  {folder.name}
                                </button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      ) : isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="rounded-xl border-border/70 shadow-sm">
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded w-1/3 animate-pulse mb-3" />
                <div className="h-20 bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !posts || posts.length === 0 ? (
        <Card className="rounded-xl border border-dashed border-border/80 bg-card/80 shadow-sm">
          <CardContent className="py-12 text-center">
            <p className="text-[15px] font-medium text-foreground">
              No posts yet
            </p>
            <p className="text-sm text-muted-foreground mt-1.5">
              Be the first to share something with the network.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCardWithLike
              key={post.id}
              post={post}
              userId={user?.id ?? null}
            />
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
