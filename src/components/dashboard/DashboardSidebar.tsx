"use client";

import { LayoutDashboard, Heart, Search, MessageSquare, User, FileText, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

interface DashboardSidebarProps {
  userType: "agent" | "buyer";
}

export function DashboardSidebar({ userType }: DashboardSidebarProps) {
  const { open } = useSidebar();
  const pathname = usePathname();

  const agentItems = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "My Profile", url: "/profile", icon: User },
    { title: "Leads", url: "/dashboard/leads", icon: FileText },
    { title: "Messages", url: "/dashboard/messages", icon: MessageSquare },
    { title: "Settings", url: "/dashboard/settings", icon: Settings },
  ];

  const buyerItems = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Favorites", url: "/dashboard/favorites", icon: Heart },
    { title: "Saved Searches", url: "/dashboard/searches", icon: Search },
    { title: "Messages", url: "/dashboard/messages", icon: MessageSquare },
    { title: "Settings", url: "/dashboard/settings", icon: Settings },
  ];

  const items = userType === "agent" ? agentItems : buyerItems;

  return (
    <Sidebar className={open ? "w-60" : "w-14"} collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{userType === "agent" ? "Professional" : "Buyer"} Dashboard</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link 
                        href={item.url}
                        className={`hover:bg-muted/50 ${isActive ? "bg-muted text-primary font-medium" : ""}`}
                      >
                        <item.icon className="h-4 w-4" />
                        {open && <span>{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
