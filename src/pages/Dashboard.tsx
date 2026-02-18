import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { FileText, MessageSquare, Heart, TrendingUp } from "lucide-react";

type UserType = "service_provider" | "agent";

const Dashboard = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [userType, setUserType] = useState<UserType>("agent");
  const [stats, setStats] = useState({
    leads: 0,
    messages: 0,
    favorites: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth");
      return;
    }

    setUser(user);
    await fetchProfile(user.id);
    await fetchStats(user.id);
    setLoading(false);
  };

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*, user_roles(role)")
      .eq("id", userId)
      .maybeSingle();

    setProfile(data);

    // Determine user type: if they have roles, they're an agent (service provider)
    // Otherwise, they're a buyer
    const hasRoles = data?.user_roles && data.user_roles.length > 0;
    setUserType(hasRoles ? "service_provider" : "agent");
  };

  const fetchStats = async (userId: string) => {
    // Fetch leads (for agents)
    const { count: leadsCount } = await supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("profile_id", userId);

    // Fetch unread messages
    const { count: messagesCount } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("recipient_id", userId)
      .eq("read", false);

    // Fetch favorites (for buyers)
    const { count: favoritesCount } = await supabase
      .from("favorites")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    setStats({
      leads: leadsCount || 0,
      messages: messagesCount || 0,
      favorites: favoritesCount || 0,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col w-full">
        <Header />
        <div className="flex flex-1 w-full">
          <DashboardSidebar userType={userType} profile={profile} />
          <main className="flex-1 p-8 bg-background">
            <div className="flex items-center gap-4 mb-8">
              <SidebarTrigger />
              <div>
                <h1 className="text-3xl font-bold">
                  Welcome back, {profile?.full_name?.split(" ")[0] || "User"}!
                </h1>
                <p className="text-muted-foreground">
                  {userType === "agent"
                    ? "Manage your professional profile and leads"
                    : "Find and connect with professionals"}
                </p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {userType === "agent" ? (
                <>
                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          New Leads
                        </p>
                        <p className="text-3xl font-bold mt-2">{stats.leads}</p>
                      </div>
                      <FileText className="h-12 w-12 text-primary opacity-50" />
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Unread Messages
                        </p>
                        <p className="text-3xl font-bold mt-2">
                          {stats.messages}
                        </p>
                      </div>
                      <MessageSquare className="h-12 w-12 text-primary opacity-50" />
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Profile Views
                        </p>
                        <p className="text-3xl font-bold mt-2">-</p>
                      </div>
                      <TrendingUp className="h-12 w-12 text-primary opacity-50" />
                    </div>
                  </Card>
                </>
              ) : (
                <>
                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Saved Favorites
                        </p>
                        <p className="text-3xl font-bold mt-2">
                          {stats.favorites}
                        </p>
                      </div>
                      <Heart className="h-12 w-12 text-primary opacity-50" />
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Unread Messages
                        </p>
                        <p className="text-3xl font-bold mt-2">
                          {stats.messages}
                        </p>
                      </div>
                      <MessageSquare className="h-12 w-12 text-primary opacity-50" />
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Saved Searches
                        </p>
                        <p className="text-3xl font-bold mt-2">-</p>
                      </div>
                      <TrendingUp className="h-12 w-12 text-primary opacity-50" />
                    </div>
                  </Card>
                </>
              )}
            </div>

            {/* Quick Actions */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userType === "agent" ? (
                  <>
                    <button
                      onClick={() => router.push("/dashboard/leads")}
                      className="p-4 text-left border rounded-lg hover:bg-muted transition-colors"
                    >
                      <FileText className="h-6 w-6 text-primary mb-2" />
                      <h3 className="font-semibold">View Leads</h3>
                      <p className="text-sm text-muted-foreground">
                        Manage incoming inquiries
                      </p>
                    </button>
                    <button
                      onClick={() => router.push("/profile")}
                      className="p-4 text-left border rounded-lg hover:bg-muted transition-colors"
                    >
                      <FileText className="h-6 w-6 text-primary mb-2" />
                      <h3 className="font-semibold">Edit Profile</h3>
                      <p className="text-sm text-muted-foreground">
                        Update your information
                      </p>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => router.push("/browse")}
                      className="p-4 text-left border rounded-lg hover:bg-muted transition-colors"
                    >
                      <TrendingUp className="h-6 w-6 text-primary mb-2" />
                      <h3 className="font-semibold">Browse Professionals</h3>
                      <p className="text-sm text-muted-foreground">
                        Find real estate experts
                      </p>
                    </button>
                    <button
                      onClick={() => router.push("/dashboard/favorites")}
                      className="p-4 text-left border rounded-lg hover:bg-muted transition-colors"
                    >
                      <Heart className="h-6 w-6 text-primary mb-2" />
                      <h3 className="font-semibold">View Favorites</h3>
                      <p className="text-sm text-muted-foreground">
                        Your saved professionals
                      </p>
                    </button>
                  </>
                )}
              </div>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
