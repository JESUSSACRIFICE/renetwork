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
import { UserTypeToggle } from "@/components/dashboard/UserTypeToggle";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-professional-profiles";

type UserType = "service_provider" | "agent";

export default function Dashboard() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile(
    user?.id ?? null,
  );
  const [userType, setUserType] = useState<UserType>("agent");
  const loading = authLoading || profileLoading;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!profile) return;

    // Check for URL parameter to override user type (for testing)
    const urlParams = new URLSearchParams(window.location.search);
    const overrideTypeParam = urlParams.get("type");

    if (overrideTypeParam === "buyer" || overrideTypeParam === "agent") {
      setUserType(overrideTypeParam === "buyer" ? "agent" : "service_provider");
      return;
    }

    // Determine user type: if they have roles, they're a service provider; otherwise, a buyer
    const hasRoles =
      profile.user_roles &&
      Array.isArray(profile.user_roles) &&
      profile.user_roles.length > 0;
    setUserType(hasRoles ? "service_provider" : "agent");
  }, [profile]);

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
        <FreeioDashboardHeader
          user={user}
          profile={profile}
          userType={userType}
        />
        <div className="flex flex-1 w-full">
          <DashboardSidebar userType={userType} profile={profile} />
          <main className="flex-1 p-8 bg-gray-50 w-full max-w-full overflow-x-hidden">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

            {/* Metrics Cards */}
            <DashboardMetrics userType={userType} />

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
        <UserTypeToggle />
      </div>
    </SidebarProvider>
  );
}
