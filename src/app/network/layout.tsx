"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Bell,
  Briefcase,
  Compass,
  LogOut,
  Menu,
  MessageSquare,
  Rss,
  Settings,
  User,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import AppHeader from "@/components/AppHeader";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth, AUTH_USER_QUERY_KEY } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { NetworkLeftRail, NetworkRightRail } from "@/components/network/NetworkSidebars";

type NavKey =
  | "feed"
  | "deals"
  | "community"
  | "messages"
  | "notifications"
  | "explore"
  | "profile"
  | "settings";

function navActive(pathname: string, key: NavKey, profileHref: string | null): boolean {
  switch (key) {
    case "feed":
      return pathname === "/network/feed" || pathname.startsWith("/network/posts/");
    case "deals":
      return pathname.startsWith("/network/deals");
    case "community":
      return pathname.startsWith("/community");
    case "messages":
      return pathname.startsWith("/dashboard/messages");
    case "notifications":
      return pathname.startsWith("/dashboard/notifications");
    case "explore":
      return pathname.startsWith("/search");
    case "profile":
      return !!profileHref && pathname === profileHref;
    case "settings":
      return pathname.startsWith("/dashboard/settings");
    default:
      return false;
  }
}

function NetworkNavLink({
  href,
  label,
  icon: Icon,
  active,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors",
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
      )}
    >
      <Icon className="h-5 w-5 shrink-0 opacity-90" strokeWidth={1.75} />
      {label}
    </Link>
  );
}

function NetworkNavList({
  pathname,
  profileHref,
  onNavigate,
}: {
  pathname: string;
  profileHref: string | null;
  onNavigate?: () => void;
}) {
  const items: { key: NavKey; href: string; label: string; icon: LucideIcon }[] = [
    { key: "feed", href: "/network/feed", label: "Feed", icon: Rss },
    { key: "deals", href: "/network/deals", label: "Deals", icon: Briefcase },
    { key: "community", href: "/community", label: "My community", icon: Users },
    { key: "messages", href: "/dashboard/messages", label: "Messages", icon: MessageSquare },
    {
      key: "notifications",
      href: "/dashboard/notifications",
      label: "Notification",
      icon: Bell,
    },
    { key: "explore", href: "/search/profiles", label: "Explore", icon: Compass },
    ...(profileHref
      ? [{ key: "profile" as const, href: profileHref, label: "Profile", icon: User }]
      : []),
    { key: "settings", href: "/dashboard/settings", label: "Settings", icon: Settings },
  ];

  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => (
        <NetworkNavLink
          key={item.key}
          href={item.href}
          label={item.label}
          icon={item.icon}
          active={navActive(pathname, item.key, profileHref)}
          onNavigate={onNavigate}
        />
      ))}
    </nav>
  );
}

export default function NetworkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const profileHref = user?.id ? `/profile/${user.id}` : null;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    queryClient.invalidateQueries({ queryKey: AUTH_USER_QUERY_KEY });
    setMobileOpen(false);
    router.push("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/80">
      <AppHeader />
      <div className="flex flex-1 min-h-0 min-w-0">
        {/* Desktop: left rail */}
        <aside className="hidden md:flex w-[220px] shrink-0 flex-col border-r border-slate-200/80 bg-[#fafafa] sticky top-16 self-start h-[calc(100dvh-4rem)] overflow-y-auto">
          <div className="p-4 pt-6">
            <NetworkNavList pathname={pathname} profileHref={profileHref} />
            {user ? (
              <button
                type="button"
                onClick={handleSignOut}
                className={cn(
                  "mt-4 flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-medium",
                  "text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                )}
              >
                <LogOut className="h-5 w-5 shrink-0" strokeWidth={1.75} />
                Logout
              </button>
            ) : null}
          </div>
        </aside>

        {/* Main workspace: mobile menu + 3-column body */}
        <div className="flex flex-1 flex-col min-w-0 min-h-0">
          <div className="flex md:hidden items-center gap-2 border-b border-slate-200/80 bg-white px-3 py-2 sticky top-16 z-30">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="shrink-0 rounded-xl" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] border-slate-200 bg-[#fafafa] p-0">
                <div className="p-4 pt-10">
                  <NetworkNavList
                    pathname={pathname}
                    profileHref={profileHref}
                    onNavigate={() => setMobileOpen(false)}
                  />
                  {user ? (
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className={cn(
                        "mt-4 flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-medium",
                        "text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      )}
                    >
                      <LogOut className="h-5 w-5 shrink-0" strokeWidth={1.75} />
                      Logout
                    </button>
                  ) : null}
                </div>
              </SheetContent>
            </Sheet>
            <span className="text-sm font-semibold text-foreground">Network</span>
          </div>

          <div className="flex flex-1 min-h-0 min-w-0">
            {/* Optional left column (layout shell only) */}
            <aside
              className="hidden xl:block w-[272px] shrink-0 overflow-y-auto border-r border-slate-200/60 py-6 pl-6 pr-4"
              aria-label="Suggestions and activity"
            >
              <NetworkLeftRail />
            </aside>

            <main className="flex-1 min-w-0 overflow-y-auto py-6 px-4 sm:px-6">{children}</main>

            {/* Right column (layout shell only) */}
            <aside
              className="hidden lg:block w-[300px] shrink-0 overflow-y-auto border-l border-slate-200/80 bg-white py-6 px-4"
              aria-label="Search and contacts"
            >
              <NetworkRightRail />
            </aside>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
