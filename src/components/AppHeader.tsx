"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Bell,
  Menu,
  User,
  LayoutDashboard,
  Settings,
  LogOut,
  ChevronDown,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth, AUTH_USER_QUERY_KEY } from "@/hooks/use-auth";
import { useUnreadCount } from "@/hooks/use-messages";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const AppHeader = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isLoading: authLoading } = useAuth();
  const { unreadCount } = useUnreadCount(user?.id ?? null);
  const navigationItems = [
    { name: "For customers", href: "/customer" },
    { name: "Referral", href: "/referral" },
    { name: "Crowdfund", href: "/crowdfund" },
    { name: "Network", href: "/network" },
    { name: "Commerce", href: "/commerce" },
  ];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    queryClient.invalidateQueries({ queryKey: AUTH_USER_QUERY_KEY });
    setMobileOpen(false);
    router.push("/");
  };

  const displayName =
    user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? "Account";
  const avatarUrl = user?.user_metadata?.avatar_url ?? undefined;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/90 shadow-sm">
      <div className="container flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-3 shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-dark text-primary-foreground font-bold text-lg shadow-lg">
            RE
          </div>
          <span className="font-bold text-xl hidden sm:block">RE Network</span>
        </Link>

        {/* Main Navigation - Desktop */}
        <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
          {navigationItems.map((item) => (
            <Link key={item.name} href={item.href}>
              <Button
                variant="ghost"
                className="h-10 px-4 text-base hover:bg-primary/10 hover:text-primary transition-colors"
              >
                {item.name}
              </Button>
            </Link>
          ))}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          {/* Message Icon - when logged in */}
          {!authLoading && user && (
            <Link href="/dashboard/messages" className="hidden sm:block">
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-accent"
              >
                <MessageSquare className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Button>
            </Link>
          )}

          {/* Notification Bell - dropdown with unread count */}
          {!authLoading && user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative hover:bg-accent hidden sm:flex"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                <DropdownMenuLabel className="flex items-center justify-between">
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-xs font-normal text-muted-foreground">
                      {unreadCount} unread
                    </span>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {unreadCount > 0 ? (
                  <DropdownMenuItem asChild>
                    <Link
                      href="/dashboard/messages"
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <MessageSquare className="h-4 w-4" />
                      You have {unreadCount} unread message
                      {unreadCount !== 1 ? "s" : ""}
                    </Link>
                  </DropdownMenuItem>
                ) : (
                  <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                    No new notifications
                  </div>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    href="/notifications"
                    className="flex items-center justify-center cursor-pointer"
                  >
                    View all notifications
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Logged out: Login + Join Now */}
          {!authLoading && !user && (
            <>
              <Link href="/auth" className="hidden lg:block">
                <Button variant="ghost" className="h-10">
                  Login
                </Button>
              </Link>
              <Link href="/auth" className="hidden lg:block">
                <Button className="h-10 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary shadow-lg">
                  Join Network
                </Button>
              </Link>
            </>
          )}

          {/* Logged in: Profile dropdown */}
          {!authLoading && user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 gap-2 pl-2 pr-2 hover:bg-accent hidden sm:flex"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={avatarUrl} alt={displayName} />
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {displayName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden lg:inline max-w-[120px] truncate text-sm font-medium">
                    {displayName}
                  </span>
                  <ChevronDown className="h-4 w-4 opacity-60 hidden lg:inline" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{displayName}</p>
                    {user.email && (
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    href={user?.id ? `/profile/${user.id}` : "/dashboard"}
                    className="flex items-center gap-2"
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex items-center gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href={
                      user?.id
                        ? `/profile/${user.id}/edit`
                        : "/dashboard/settings"
                    }
                    className="flex items-center gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Mobile Menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 overflow-y-auto">
              <div className="flex flex-col gap-6 py-6">
                {/* Mobile Navigation Items */}
                <div className="space-y-2">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="block px-4 py-3 rounded-lg hover:bg-accent transition-colors text-base font-medium"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>

                <div className="border-t pt-6 space-y-3">
                  {user && (
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        router.push("/dashboard/messages");
                        setMobileOpen(false);
                      }}
                    >
                      <MessageSquare className="h-5 w-5 mr-2" />
                      Messages
                      {unreadCount > 0 && (
                        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-medium text-primary-foreground">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                      )}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      router.push("/notifications");
                      setMobileOpen(false);
                    }}
                  >
                    <Bell className="h-5 w-5 mr-2" />
                    Notifications
                    {user && unreadCount > 0 && (
                      <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-medium text-primary-foreground">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </Button>

                  {!user ? (
                    <>
                      <Link
                        href="/auth"
                        className="block"
                        onClick={() => setMobileOpen(false)}
                      >
                        <Button variant="ghost" className="w-full">
                          Login
                        </Button>
                      </Link>
                      <Link
                        href="/auth"
                        className="block"
                        onClick={() => setMobileOpen(false)}
                      >
                        <Button className="w-full bg-gradient-to-r from-primary to-primary-dark">
                          Join Network
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        href={user.id ? `/profile/${user.id}` : "/dashboard"}
                        className="block"
                        onClick={() => setMobileOpen(false)}
                      >
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                        >
                          <User className="h-5 w-5 mr-2" />
                          Profile
                        </Button>
                      </Link>
                      <Link
                        href="/dashboard"
                        className="block"
                        onClick={() => setMobileOpen(false)}
                      >
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                        >
                          <LayoutDashboard className="h-5 w-5 mr-2" />
                          Dashboard
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-destructive"
                        onClick={handleSignOut}
                      >
                        <LogOut className="h-5 w-5 mr-2" />
                        Sign out
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
