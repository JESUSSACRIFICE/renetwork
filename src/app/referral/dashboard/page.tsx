"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ReferralHeader from "@/components/referral/ReferralHeader";
import ReferralFooter from "@/components/referral/ReferralFooter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import {
  Briefcase,
  DollarSign,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userType, setUserType] = useState<"customer" | "psp" | "agency">(
    "customer",
  );

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/auth");
        return;
      }
      setUser(user);
      // Determine user type - in real app, fetch from profile
      // For now, default to customer
    });
  }, [router]);

  // Mock data
  const stats = {
    customer: {
      activeOrders: 3,
      completedOrders: 12,
      totalSpent: "$2,450",
      saved: "$320",
    },
    psp: {
      activeProjects: 5,
      completedProjects: 45,
      totalEarnings: "$12,500",
      pendingPayments: "$1,200",
    },
    agency: {
      activeListings: 12,
      teamMembers: 25,
      totalRevenue: "$450,000",
      referralsReceived: 18,
    },
  };

  const recentActivity = [
    {
      id: 1,
      type: "order",
      title: "Order #1234",
      status: "in-progress",
      date: "2 days ago",
    },
    {
      id: 2,
      type: "payment",
      title: "Payment received",
      status: "completed",
      date: "1 week ago",
    },
    {
      id: 3,
      type: "referral",
      title: "New referral",
      status: "pending",
      date: "2 weeks ago",
    },
  ];

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 w-full">
      <ReferralHeader />
      <main className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user.email}</p>
          </div>

          <Tabs
            defaultValue={userType}
            onValueChange={(v) => setUserType(v as any)}
          >
            <TabsList>
              <TabsTrigger value="customer">Customer</TabsTrigger>
              <TabsTrigger value="psp">PSP</TabsTrigger>
              <TabsTrigger value="agency">Agency</TabsTrigger>
            </TabsList>

            {/* Customer Dashboard */}
            <TabsContent value="customer" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Active Orders
                    </CardTitle>
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.customer.activeOrders}
                    </div>
                    <p className="text-xs text-muted-foreground">In progress</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Completed
                    </CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.customer.completedOrders}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Total orders
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Spent
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.customer.totalSpent}
                    </div>
                    <p className="text-xs text-muted-foreground">All time</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Saved</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.customer.saved}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Through referrals
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-center justify-between border-b pb-4 last:border-0"
                      >
                        <div>
                          <p className="font-medium">{activity.title}</p>
                          <p className="text-sm text-gray-500">
                            {activity.date}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            activity.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : activity.status === "in-progress"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {activity.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* PSP Dashboard */}
            <TabsContent value="psp" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Active Projects
                    </CardTitle>
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.psp.activeProjects}
                    </div>
                    <p className="text-xs text-muted-foreground">In progress</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Completed
                    </CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.psp.completedProjects}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Total projects
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Earnings
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.psp.totalEarnings}
                    </div>
                    <p className="text-xs text-muted-foreground">All time</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Pending
                    </CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.psp.pendingPayments}
                    </div>
                    <p className="text-xs text-muted-foreground">In escrow</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Agency Dashboard */}
            <TabsContent value="agency" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Active Listings
                    </CardTitle>
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.agency.activeListings}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Current listings
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Team Members
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.agency.teamMembers}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Active agents
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Revenue
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.agency.totalRevenue}
                    </div>
                    <p className="text-xs text-muted-foreground">This year</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Referrals
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.agency.referralsReceived}
                    </div>
                    <p className="text-xs text-muted-foreground">Received</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/referral/register">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle>Post a Service</CardTitle>
                  <CardDescription>List your services</CardDescription>
                </CardHeader>
              </Card>
            </Link>
            <Link href="/referral/settings">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle>Settings</CardTitle>
                  <CardDescription>Manage your account</CardDescription>
                </CardHeader>
              </Card>
            </Link>
            <Link href="/referral/benefits">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle>Benefits</CardTitle>
                  <CardDescription>View your benefits</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </div>
      </main>
      <ReferralFooter />
    </div>
  );
}
