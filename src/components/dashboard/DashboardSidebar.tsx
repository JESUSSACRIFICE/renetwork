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
  HandCoins,
  Network,
  PieChart,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  GraduationCap,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState, useEffect } from "react";

interface MenuItemBase {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface MenuItemWithChildren extends MenuItemBase {
  children: { title: string; url: string }[];
}

type MenuItem = MenuItemBase | MenuItemWithChildren;

function hasChildren(item: MenuItem): item is MenuItemWithChildren {
  return "children" in item && Array.isArray(item.children);
}

interface DashboardSidebarProps {
  userType: "service_provider" | "agent";
  profile?: any;
  isAdmin?: boolean;
}

const ANALYTICS_ITEM: MenuItemWithChildren = {
  title: "Analytics",
  url: "/dashboard/analytics",
  icon: BarChart3,
  children: [
    { title: "Revenue", url: "/dashboard/analytics/revenue" },
    { title: "Engagement", url: "/dashboard/analytics/engagement" },
    { title: "Conversion", url: "/dashboard/analytics/conversion" },
  ],
};

const INVESTOR_ITEM: MenuItemWithChildren = {
  title: "Investor",
  url: "/dashboard/investor",
  icon: PieChart,
  children: [
    { title: "Dashboard", url: "/dashboard/investor" },
    { title: "ROI", url: "/dashboard/investor/roi" },
  ],
};

export function DashboardSidebar({ userType, profile, isAdmin }: DashboardSidebarProps) {
  const pathname = usePathname();
  const isAnalyticsActive = pathname.startsWith("/dashboard/analytics");
  const isInvestorActive = pathname.startsWith("/dashboard/investor");
  const [analyticsOpen, setAnalyticsOpen] = useState(isAnalyticsActive);
  const [investorOpen, setInvestorOpen] = useState(isInvestorActive);

  useEffect(() => {
    if (isAnalyticsActive) setAnalyticsOpen(true);
  }, [isAnalyticsActive]);

  useEffect(() => {
    if (isInvestorActive) setInvestorOpen(true);
  }, [isInvestorActive]);

  const buyerMenuItems: MenuItem[] = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    INVESTOR_ITEM,
    // { title: "My Jobs", url: "/dashboard/jobs", icon: Briefcase },
    {
      title: "Referrals to You",
      url: "/dashboard/referrals-in",
      icon: Briefcase,
    },
    {
      title: "Referral Earnings",
      url: "/dashboard/referral",
      icon: TrendingUp,
    },
    { title: "Training", url: "/dashboard/training", icon: GraduationCap },
    // { title: "My Projects", url: "/dashboard/projects", icon: Briefcase },
    // { title: "Jobs Applicants", url: "/dashboard/applicants", icon: Hourglass },
    { title: "Services", url: "/dashboard/services", icon: DollarSign },
    { title: "Crowdfunding", url: "/dashboard/crowdfunding", icon: HandCoins },
    { title: "Network", url: "/network/feed", icon: Network },
    { title: "Offers", url: "/dashboard/offers", icon: FileCheck },
    // { title: "Favorite", url: "/dashboard/favorites", icon: Heart },
    // { title: "Meetings", url: "/dashboard/meetings", icon: Target },
    { title: "Messages", url: "/dashboard/messages", icon: Printer },
    { title: "Notifications", url: "/dashboard/notifications", icon: Bell },
    { title: "Reviews", url: "/dashboard/reviews", icon: Star },
    ANALYTICS_ITEM,
    { title: "Payments", url: "/dashboard/payments", icon: CreditCard },
    { title: "Settings", url: "/dashboard/settings", icon: Settings },
    {
      title: "Reset Password",
      url: "/dashboard/reset-password",
      icon: KeyRound,
    },
    { title: "Help & Support", url: "/dashboard/help", icon: HelpCircle },
    ...(isAdmin
      ? [
          { title: "Admin", url: "/dashboard/admin", icon: ShieldCheck },
          { title: "Compliance", url: "/dashboard/compliance", icon: ShieldCheck },
        ]
      : []),
  ];

  const agentMenuItems: MenuItem[] = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    INVESTOR_ITEM,
    { title: "My Services", url: "/dashboard/services", icon: Briefcase },
    {
      title: "Referrals to You",
      url: "/dashboard/referrals-in",
      icon: Briefcase,
    },
    {
      title: "Referral Earnings",
      url: "/dashboard/referral",
      icon: TrendingUp,
    },
    { title: "Training", url: "/dashboard/training", icon: GraduationCap },
    { title: "Proposals", url: "/dashboard/proposals", icon: FileText },
    { title: "Crowdfunding", url: "/dashboard/crowdfunding", icon: HandCoins },
    { title: "Network", url: "/network/feed", icon: Network },
    { title: "Offers", url: "/dashboard/offers", icon: FileCheck },
    // { title: "Jobs Applied", url: "/dashboard/jobs-applied", icon: Hourglass },
    // { title: "Jobs Alerts", url: "/dashboard/alerts", icon: Bell },
    // { title: "Favorite", url: "/dashboard/favorites", icon: Heart },
    // { title: "Meetings", url: "/dashboard/meetings", icon: Calendar },
    { title: "Messages", url: "/dashboard/messages", icon: Printer },
    { title: "Notifications", url: "/dashboard/notifications", icon: Bell },
    // { title: "Statements", url: "/dashboard/statements", icon: Layers },
    { title: "Earnings", url: "/dashboard/earnings", icon: TrendingUp },
    // { title: "Wallet", url: "/dashboard/wallet", icon: Wallet },
    { title: "Reviews", url: "/dashboard/reviews", icon: Star },
    ANALYTICS_ITEM,
    { title: "Settings", url: "/dashboard/settings", icon: Settings },
    {
      title: "Reset Password",
      url: "/dashboard/reset-password",
      icon: KeyRound,
    },
    { title: "Help & Support", url: "/dashboard/help", icon: HelpCircle },
    ...(isAdmin
      ? [
          { title: "Admin", url: "/dashboard/admin", icon: ShieldCheck },
          { title: "Compliance", url: "/dashboard/compliance", icon: ShieldCheck },
        ]
      : []),
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
              if (hasChildren(item)) {
                const isActive = pathname.startsWith(item.url);
                const isOpen =
                  item.url === "/dashboard/analytics"
                    ? analyticsOpen
                    : item.url === "/dashboard/investor"
                      ? investorOpen
                      : false;
                const setOpen =
                  item.url === "/dashboard/analytics"
                    ? setAnalyticsOpen
                    : item.url === "/dashboard/investor"
                      ? setInvestorOpen
                      : () => {};
                return (
                  <li key={item.title}>
                    <Collapsible open={isOpen} onOpenChange={setOpen}>
                      <CollapsibleTrigger
                        className={cn(
                          "flex items-center justify-between w-full px-4 py-3 rounded-lg transition-colors",
                          isActive
                            ? "bg-gray-900 text-white"
                            : "text-gray-700 hover:bg-gray-100",
                        )}
                      >
                        <div className="flex items-center space-x-3">
                          <item.icon
                            className={cn(
                              "w-5 h-5 flex-shrink-0",
                              isActive ? "text-white" : "text-gray-600",
                            )}
                          />
                          <span className="font-medium text-sm">{item.title}</span>
                        </div>
                        {isOpen ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <ul className="mt-1 ml-4 space-y-1 border-l border-gray-200 pl-3">
                          {item.children.map((child) => {
                            const isChildActive = pathname === child.url;
                            return (
                              <li key={child.url}>
                                <Link
                                  href={child.url}
                                  className={cn(
                                    "flex items-center px-3 py-2 rounded-md text-sm transition-colors",
                                    isChildActive
                                      ? "bg-gray-900 text-white font-medium"
                                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                                  )}
                                >
                                  {child.title}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </CollapsibleContent>
                    </Collapsible>
                  </li>
                );
              }
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
