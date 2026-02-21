"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  Hourglass,
  DollarSign,
  Heart,
  Target,
  Printer,
  FileText,
  MessageSquare,
  Bell,
  Calendar,
  Layers,
  Settings,
  User,
  Wallet,
  TrendingUp,
  CreditCard,
  HelpCircle,
  LogOut,
  Star,
  BarChart3,
  KeyRound,
  FileCheck,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DashboardSidebarProps {
  userType: "service_provider" | "agent";
  profile?: any;
}

export function DashboardSidebar({ userType, profile }: DashboardSidebarProps) {
  const pathname = usePathname();

  const buyerMenuItems = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    // { title: "My Jobs", url: "/dashboard/jobs", icon: Briefcase },
    {
      title: "Referrals to You",
      url: "/dashboard/referrals-in",
      icon: Briefcase,
    },
    {
      title: "Referral Earnings",
      url: "/referral/dashboard",
      icon: TrendingUp,
    },
    // { title: "My Projects", url: "/dashboard/projects", icon: Briefcase },
    // { title: "Jobs Applicants", url: "/dashboard/applicants", icon: Hourglass },
    { title: "Services", url: "/dashboard/services", icon: DollarSign },
    { title: "Offers", url: "/dashboard/offers", icon: FileCheck },
    // { title: "Favorite", url: "/dashboard/favorites", icon: Heart },
    // { title: "Meetings", url: "/dashboard/meetings", icon: Target },
    { title: "Messages", url: "/dashboard/messages", icon: Printer },
    { title: "Reviews", url: "/dashboard/reviews", icon: Star },
    { title: "Payments", url: "/dashboard/payments", icon: CreditCard },
    { title: "Settings", url: "/dashboard/settings", icon: Settings },
    {
      title: "Reset Password",
      url: "/dashboard/reset-password",
      icon: KeyRound,
    },
    { title: "Help & Support", url: "/dashboard/help", icon: HelpCircle },
  ];

  const agentMenuItems = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "My Services", url: "/dashboard/services", icon: Briefcase },
    {
      title: "Referrals to You",
      url: "/dashboard/referrals-in",
      icon: Briefcase,
    },
    {
      title: "Referral Earnings",
      url: "/referral/dashboard",
      icon: TrendingUp,
    },
    { title: "Proposals", url: "/dashboard/proposals", icon: FileText },
    { title: "Offers", url: "/dashboard/offers", icon: FileCheck },
    // { title: "Jobs Applied", url: "/dashboard/jobs-applied", icon: Hourglass },
    // { title: "Jobs Alerts", url: "/dashboard/alerts", icon: Bell },
    // { title: "Favorite", url: "/dashboard/favorites", icon: Heart },
    // { title: "Meetings", url: "/dashboard/meetings", icon: Calendar },
    { title: "Messages", url: "/dashboard/messages", icon: Printer },
    // { title: "Statements", url: "/dashboard/statements", icon: Layers },
    { title: "Earnings", url: "/dashboard/earnings", icon: TrendingUp },
    // { title: "Wallet", url: "/dashboard/wallet", icon: Wallet },
    { title: "Reviews", url: "/dashboard/reviews", icon: Star },
    { title: "Analytics", url: "/dashboard/analytics", icon: BarChart3 },
    { title: "Settings", url: "/dashboard/settings", icon: Settings },
    {
      title: "Reset Password",
      url: "/dashboard/reset-password",
      icon: KeyRound,
    },
    { title: "Help & Support", url: "/dashboard/help", icon: HelpCircle },
  ];

  const menuItems =
    userType === "service_provider" ? agentMenuItems : buyerMenuItems;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-[calc(100vh-5rem)]">
      {/* Profile Section */}
      {/* <div className="p-6 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <Avatar className="w-12 h-12">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback className="bg-primary text-white">
              {profile?.full_name?.charAt(0) || userType.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 capitalize truncate">
              {profile?.full_name || (userType === "service_provider" ? "Buyer" : "Agent")}
            </div>
            <Link
              href={`/profile/${profile?.id || ""}`}
              className="text-sm text-primary hover:underline"
            >
              View Profile
            </Link>
          </div>
        </div>
      </div> */}

      {/* Navigation Menu with Scroll */}
      <ScrollArea className="flex-1">
        <nav className="p-4">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const isActive =
                pathname === item.url ||
                (pathname.startsWith(item.url) && item.url !== "/dashboard");
              return (
                <li key={item.title}>
                  <Link
                    href={item.url}
                    className={cn(
                      "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors w-full",
                      isActive
                        ? "bg-gray-900 text-white"
                        : "text-gray-700 hover:bg-gray-100",
                    )}
                  >
                    <item.icon
                      className={cn(
                        "w-5 h-5 flex-shrink-0",
                        isActive ? "text-white" : "text-gray-600",
                      )}
                    />
                    <span className="font-medium text-sm">{item.title}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </ScrollArea>
    </aside>
  );
}
