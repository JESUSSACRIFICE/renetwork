"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Bell, LogOut, MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { supabase } from "@/integrations/supabase/client";
import { useUnreadCount } from "@/hooks/use-messages";

interface FreeioDashboardHeaderProps {
  user: any;
  profile: any;
  userType: "service_provider" | "agent";
}

export function FreeioDashboardHeader({
  user,
  profile,
  userType,
}: FreeioDashboardHeaderProps) {
  const router = useRouter();
  const { unreadCount } = useUnreadCount(user?.id ?? null);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 w-full">
      <div className="w-full px-4">
        <div className="flex items-center justify-between h-20 max-w-[1920px] mx-auto">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-white font-bold text-lg">
              R
            </div>
            <span className="text-xl font-bold text-gray-900">RE Network</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            <NavigationMenu>
              <NavigationMenuList className="space-x-1">
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-gray-700 hover:text-gray-900">
                    Categories
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[200px] p-2">
                      <Link
                        href="#"
                        className="block px-3 py-2 hover:bg-gray-100 rounded text-sm"
                      >
                        All Categories
                      </Link>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-gray-700 hover:text-gray-900">
                    Home
                  </NavigationMenuTrigger>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-gray-700 hover:text-gray-900">
                    Browse Jobs
                  </NavigationMenuTrigger>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-gray-700 hover:text-gray-900">
                    Users
                  </NavigationMenuTrigger>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-gray-700 hover:text-gray-900">
                    Blog
                  </NavigationMenuTrigger>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-gray-700 hover:text-gray-900">
                    Pages
                  </NavigationMenuTrigger>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Search className="w-5 h-5 text-gray-600" />
            </button>

            <button
              className="relative p-2 hover:bg-gray-100 rounded-full"
              onClick={() => router.push("/dashboard/messages")}
              aria-label="Messages"
            >
              <MessageSquare className="w-5 h-5 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>
            <button className="relative p-2 hover:bg-gray-100 rounded-full">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center space-x-2 hover:bg-gray-100 rounded-lg px-3 py-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback className="bg-primary text-white">
                    {profile?.full_name?.charAt(0) ||
                      user?.email?.charAt(0) ||
                      "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <div className="text-sm font-medium text-gray-900 capitalize">
                    {profile?.full_name}
                  </div>
                  {/* <div className="text-xs text-gray-500 capitalize">
                    {userType === "service_provider" ? "Buyer" : "Agent"}
                  </div> */}
                </div>
                {/* <ChevronDown className="w-4 h-4 text-gray-500 hidden md:block" /> */}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push(`/profile/${user?.id}`)}
                >
                  View Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push("/dashboard/messages")}
                >
                  Messages
                  {unreadCount > 0 && (
                    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-medium text-primary-foreground">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push("/dashboard/settings")}
                >
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive focus:text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
