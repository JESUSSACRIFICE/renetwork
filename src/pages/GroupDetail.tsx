import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Users, Plus, MessageSquare, Pin, Eye, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { z } from "zod";

const postSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  content: z.string().trim().min(10, "Content must be at least 10 characters").max(10000, "Content must be less than 10,000 characters")
});

interface Group {
  id: string;
  title: string;
  description: string | null;
  category: string;
  owner_id: string;
  member_count: number;
}

interface Post {
  id: string;
  title: string;
  content: string;
  author_id: string;
  is_pinned: boolean;
  reply_count: number;
  view_count: number;
  created_at: string;
  profiles?: {
    full_name: string;
    avatar_url: string | null;
  };
}

const GroupDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [group, setGroup] = useState<Group | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isMember, setIsMember] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPost, setNewPost] = useState({
    title: "",
    content: ""
  });

  useEffect(() => {
    checkAuth();
    fetchGroupAndPosts();
  }, [id]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    
    if (user && id) {
      const { data } = await supabase
        .from('group_members')
        .select('*')
        .eq('group_id', id)
        .eq('user_id', user.id)
        .single();
      
      setIsMember(!!data);
    }
  };

  const fetchGroupAndPosts = async () => {
    try {
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .select('*')
        .eq('id', id)
        .single();

      if (groupError) throw groupError;
      setGroup(groupData);

      const { data: postsData, error: postsError } = await supabase
        .from('forum_posts')
        .select('*')
        .eq('group_id', id)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      // Fetch profiles separately
      if (postsData && postsData.length > 0) {
        const authorIds = [...new Set(postsData.map(p => p.author_id))];
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', authorIds);

        const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);
        const postsWithProfiles = postsData.map(post => ({
          ...post,
          profiles: profilesMap.get(post.author_id) || { full_name: 'Unknown', avatar_url: null }
        }));
        setPosts(postsWithProfiles as any);
      } else {
        setPosts([]);
      }

      if (postsError) throw postsError;
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load group data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const joinGroup = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please login to join this group",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('group_members')
        .insert({
          group_id: id,
          user_id: user.id
        });

      if (error) throw error;

      setIsMember(true);
      toast({
        title: "Success",
        description: "You've joined the group"
      });
    } catch (error) {
      console.error('Error joining group:', error);
      toast({
        title: "Error",
        description: "Failed to join group",
        variant: "destructive"
      });
    }
  };

  const createPost = async () => {
    if (!user || !isMember) {
      toast({
        title: "Error",
        description: "You must be a member to create posts",
        variant: "destructive"
      });
      return;
    }

    // Validate input with zod schema
    const validationResult = postSchema.safeParse(newPost);
    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      toast({
        title: "Validation Error",
        description: firstError.message,
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('forum_posts')
        .insert({
          title: validationResult.data.title,
          content: validationResult.data.content,
          group_id: id,
          author_id: user.id
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Post created successfully"
      });
      
      setIsDialogOpen(false);
      setNewPost({ title: "", content: "" });
      fetchGroupAndPosts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <p>Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <p>Group not found</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate('/community')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Community
        </Button>

        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-3xl mb-2">{group.title}</CardTitle>
                <CardDescription className="capitalize">{group.category}</CardDescription>
              </div>
              {!isMember && (
                <Button onClick={joinGroup}>
                  <Users className="mr-2 h-4 w-4" />
                  Join Group
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{group.description}</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{group.member_count} members</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Discussions</h2>
          {isMember && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Post
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Post</DialogTitle>
                  <DialogDescription>
                    Start a new discussion in this group
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Post Title</Label>
                    <Input
                      id="title"
                      value={newPost.title}
                      onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                      placeholder="Enter post title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      value={newPost.content}
                      onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                      placeholder="Share your thoughts..."
                      rows={6}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={createPost}>Create Post</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {posts.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                No posts yet. {isMember && "Be the first to start a discussion!"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <Card key={post.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    {post.is_pinned && (
                      <Pin className="h-4 w-4 text-primary mt-1" />
                    )}
                    <div className="flex-1">
                      <CardTitle className="text-xl">{post.title}</CardTitle>
                      <CardDescription>
                        by {post.profiles?.full_name || 'Unknown'} • {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {post.content}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      <span>{post.reply_count} replies</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{post.view_count} views</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default GroupDetail;