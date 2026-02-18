"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { FreeioDashboardHeader } from "@/components/dashboard/FreeioDashboardHeader";
import { FreeioFooter } from "@/components/dashboard/FreeioFooter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

type UserType = "service_provider" | "agent";

export default function SavedSearches() {
  const router = useRouter();
  const [searches, setSearches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [userType, setUserType] = useState<UserType>("agent");

  useEffect(() => {
    checkAuthAndFetch();
  }, []);

  const checkAuthAndFetch = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth");
      return;
    }
    setUser(user);
    await fetchProfile(user.id);
    fetchSearches(user.id);
  };

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*, user_roles(role)")
      .eq("id", userId)
      .maybeSingle();

    setProfile(data);

    // Check for URL parameter to override user type (for testing)
    const urlParams = new URLSearchParams(window.location.search);
    const overrideTypeParam = urlParams.get("type");

    if (overrideTypeParam === "buyer" || overrideTypeParam === "agent") {
      setUserType(overrideTypeParam === "buyer" ? "agent" : "service_provider");
      return;
    }

    // Determine user type: if they have roles, they're an agent (service provider)
    // Otherwise, they're a buyer
    const hasRoles = data?.user_roles && data.user_roles.length > 0;
    setUserType(hasRoles ? "service_provider" : "agent");
  };

  const fetchSearches = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("saved_searches")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSearches(data || []);
    } catch (error: any) {
      toast.error("Failed to load searches");
    } finally {
      setLoading(false);
    }
  };

  const deleteSearch = async (id: string) => {
    try {
      await supabase.from("saved_searches").delete().eq("id", id);
      setSearches(searches.filter((s) => s.id !== id));
      toast.success("Search deleted");
    } catch (error: any) {
      toast.error("Failed to delete search");
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col bg-gray-50 w-full">
        <FreeioDashboardHeader
          user={user}
          profile={profile}
          userType={userType}
        />
        <div className="flex flex-1">
          <DashboardSidebar userType={userType} profile={profile} />
          <main className="flex-1 p-8 bg-gray-50">
            <div className="flex items-center gap-4 mb-8">
              <SidebarTrigger />
              <div>
                <h1 className="text-3xl font-bold">Saved Searches</h1>
                <p className="text-muted-foreground">
                  Your saved search filters
                </p>
              </div>
            </div>

            {loading ? (
              <p className="text-center text-muted-foreground">Loading...</p>
            ) : searches.length === 0 ? (
              <Card className="p-12 text-center">
                <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  No saved searches yet
                </p>
                <Button onClick={() => router.push("/browse")}>
                  Start Searching
                </Button>
              </Card>
            ) : (
              <div className="grid gap-4">
                {searches.map((search) => (
                  <Card key={search.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold mb-2">{search.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {Object.keys(search.search_params).length} filters
                          applied
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            const params = new URLSearchParams(
                              search.search_params,
                            );
                            router.push(`/browse?${params.toString()}`);
                          }}
                        >
                          Apply Search
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteSearch(search.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </main>
        </div>
        <FreeioFooter />
      </div>
    </SidebarProvider>
  );
}
