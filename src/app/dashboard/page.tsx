"use client";

import { useEffect, useState } from "react";
import { useProfile } from "@/hooks/use-professional-profiles";
import { useAuth } from "@/hooks/use-auth";
import { DashboardMetrics } from "@/components/dashboard/DashboardMetrics";
import { PageViewsChart } from "@/components/dashboard/PageViewsChart";
import { DashboardNotifications } from "@/components/dashboard/DashboardNotifications";
import { RecentProposals } from "@/components/dashboard/RecentProposals";

type UserType = "service_provider" | "agent";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id ?? null);
  const [userType, setUserType] = useState<UserType>("agent");

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

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      {/* Metrics Cards */}
      <DashboardMetrics userType={userType} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2">
          <PageViewsChart userType={userType} />
        </div>
        <div className="lg:col-span-1">
          <DashboardNotifications userType={userType} />
        </div>
      </div>

      {/* Recent Proposals / Service Orders */}
      <div className="mt-6">
        <RecentProposals userType={userType} />
      </div>
    </div>
  );
}
