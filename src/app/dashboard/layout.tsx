"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { FreeioDashboardHeader } from "@/components/dashboard/FreeioDashboardHeader";
import { FreeioFooter } from "@/components/dashboard/FreeioFooter";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-professional-profiles";

type UserType = "service_provider" | "agent";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

    const urlParams = new URLSearchParams(window.location.search);
    const overrideTypeParam = urlParams.get("type");

    if (overrideTypeParam === "buyer" || overrideTypeParam === "agent") {
      setUserType(overrideTypeParam === "buyer" ? "agent" : "service_provider");
      return;
    }

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

  if (!user) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col bg-gray-50 w-full">
        <FreeioDashboardHeader
          user={user}
          profile={profile ?? undefined}
          userType={userType}
        />
        <div className="flex flex-1 w-full">
          <DashboardSidebar
            userType={userType}
            profile={profile ?? undefined}
          />
          <main className="flex-1 flex flex-col min-h-0 w-full max-w-full overflow-x-hidden overflow-y-auto bg-gray-50">
            {children}
          </main>
        </div>
        <FreeioFooter />
      </div>
    </SidebarProvider>
  );
}
