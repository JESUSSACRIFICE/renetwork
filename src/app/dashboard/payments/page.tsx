"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { FreeioDashboardHeader } from "@/components/dashboard/FreeioDashboardHeader";
import { FreeioFooter } from "@/components/dashboard/FreeioFooter";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type UserType = "service_provider" | "agent";

export default function PaymentsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [userType, setUserType] = useState<UserType>("agent");
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
    setLoading(false);
  };

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*, user_roles(role)")
      .eq("id", userId)
      .maybeSingle();
    setProfile(data);
    const hasRoles = data?.user_roles && data.user_roles.length > 0;
    setUserType(hasRoles ? "service_provider" : "agent");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
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
        <div className="flex flex-1">
          <DashboardSidebar userType={userType} profile={profile} />
          <main className="flex-1 p-8 bg-gray-50">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Payments</h1>
            <Card>
              <CardHeader>
                <CardTitle>Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Your payment history will appear here.
                </p>
              </CardContent>
            </Card>
          </main>
        </div>
        <FreeioFooter />
      </div>
    </SidebarProvider>
  );
}
