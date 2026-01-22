"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { FreeioDashboardHeader } from "@/components/dashboard/FreeioDashboardHeader";
import { DashboardMetrics } from "@/components/dashboard/DashboardMetrics";
import { PageViewsChart } from "@/components/dashboard/PageViewsChart";
import { DashboardNotifications } from "@/components/dashboard/DashboardNotifications";
import { RecentProposals } from "@/components/dashboard/RecentProposals";
import { FreeioFooter } from "@/components/dashboard/FreeioFooter";
import { supabase } from "@/integrations/supabase/client";

type UserType = "buyer" | "agent";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [userType, setUserType] = useState<UserType>("agent");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push("/auth");
      return;
    }

    setUser(user);
    await fetchProfile(user.id);
    setLoading(false);
  };

  const fetchProfile = async (userId: string) => {
    // Query profiles first (without join to avoid 400 errors)
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    
    if (error) {
      console.error("[DASHBOARD] Error fetching profile:", error);
      // If it's a 400 error, the table might have issues, but try to continue
      if (error.code === "PGRST116" || error.message?.includes("relation") || error.message?.includes("does not exist")) {
        console.error("[DASHBOARD] Profiles table might not exist or has schema issues");
        router.push("/register");
        return;
      }
    }
    
    // Check if user has completed registration
    if (!data) {
      console.log("[DASHBOARD] No profile found, redirecting to /register");
      router.push("/register");
      return;
    }
    
    // Fetch user_roles separately if needed (they're not critical for access)
    let userRoles: any[] = [];
    try {
      const { data: rolesData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);
      userRoles = rolesData || [];
    } catch (rolesError) {
      console.warn("[DASHBOARD] Could not fetch user_roles (non-critical):", rolesError);
      // Continue without roles - not critical for dashboard access
    }

    const profileData = data as any;
    
    // SIMPLIFIED VALIDATION: If they have user_type OR registration_status, allow access
    console.log("[DASHBOARD] Checking registration status for user:", userId);
    console.log("[DASHBOARD] Profile data:", {
      user_type: profileData?.user_type,
      registration_status: profileData?.registration_status,
      has_first_name: !!profileData?.first_name,
      has_last_name: !!profileData?.last_name,
      has_full_name: !!profileData?.full_name,
    });
    
    // PRIMARY CHECK: If registration_status exists, they've submitted the form
    if (profileData?.registration_status) {
      console.log("[DASHBOARD] ✅ Registration status found:", profileData.registration_status, "- ALLOWING ACCESS");
      // Continue to dashboard - no redirect
    } 
    // SECONDARY CHECK: If user_type is set, they've at least started registration
    else if (profileData?.user_type) {
      console.log("[DASHBOARD] ✅ User type found:", profileData.user_type, "- ALLOWING ACCESS");
      // Continue to dashboard - no redirect
    }
    // FALLBACK: Check for basic info
    else if (profileData?.first_name || profileData?.last_name || profileData?.full_name) {
      console.log("[DASHBOARD] ✅ Basic profile info found - ALLOWING ACCESS");
      // Continue to dashboard - no redirect
    }
    // NO DATA: Redirect to registration
    else {
      console.log("[DASHBOARD] ❌ No registration data found - redirecting to /register");
      router.push("/register");
      return;
    }
    
    console.log("[DASHBOARD] ✅ Registration validated - allowing dashboard access");
    
    setProfile(data);
    
    // Check for URL parameter to override user type (for testing)
    const urlParams = new URLSearchParams(window.location.search);
    const overrideTypeParam = urlParams.get('type');
    
    if (overrideTypeParam === "buyer" || overrideTypeParam === "agent") {
      setUserType(overrideTypeParam as UserType);
      return;
    }
    
    // Determine user type from profile.user_type field (from registration form)
    // service_provider = agent, business_buyer = buyer
    if (profileData?.user_type === "service_provider") {
      console.log("[DASHBOARD] User type determined from profile: service_provider -> agent");
      setUserType("agent");
    } else if (profileData?.user_type === "business_buyer") {
      console.log("[DASHBOARD] User type determined from profile: business_buyer -> buyer");
      setUserType("buyer");
    } else {
      // Fallback: if user_roles exist, they're an agent
      const hasRoles = userRoles && userRoles.length > 0;
      console.log("[DASHBOARD] User type fallback: using user_roles check", { hasRoles, userRoles });
      setUserType((hasRoles ? "agent" : "buyer") as UserType);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col bg-gray-50 w-full">
        <FreeioDashboardHeader user={user} profile={profile} userType={userType} />
        <div className="flex flex-1 w-full">
          <DashboardSidebar userType={userType} profile={profile} />
          <main className="flex-1 p-8 bg-gray-50 w-full max-w-full overflow-x-hidden">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
            
            {/* Metrics Cards */}
            <DashboardMetrics userType={userType} profile={profile} />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
              {/* Page Views Chart - Takes 2 columns */}
              <div className="lg:col-span-2">
                <PageViewsChart userType={userType} />
              </div>
              
              {/* Notifications - Takes 1 column */}
              <div className="lg:col-span-1">
                <DashboardNotifications userType={userType} />
              </div>
            </div>

            {/* Recent Proposals / Service Orders */}
            <div className="mt-6">
              <RecentProposals userType={userType} />
            </div>
          </main>
        </div>
        <FreeioFooter />
      </div>
    </SidebarProvider>
  );
}