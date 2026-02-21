"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Bell, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { useUnreadCount } from "@/hooks/use-messages";

export default function FreeioHeader() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { unreadCount } = useUnreadCount(user?.id ?? null);

  return (
    <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-gray-900">
            RE Network
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-gray-700 hover:text-gray-900 font-medium"
            >
              Home
            </Link>
            <Link
              href="/search/services-jobs"
              className="text-gray-700 hover:text-gray-900 font-medium"
            >
              Browse Jobs
            </Link>
            <Link
              href="/users"
              className="text-gray-700 hover:text-gray-900 font-medium"
            >
              Users
            </Link>
            <Link
              href="/blog"
              className="text-gray-700 hover:text-gray-900 font-medium"
            >
              Blog
            </Link>
            <Link
              href="/pages"
              className="text-gray-700 hover:text-gray-900 font-medium"
            >
              Pages
            </Link>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Message Icon - when logged in */}
            {!authLoading && user && (
              <Link href="/dashboard/messages">
                <button
                  className="relative p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100"
                  aria-label="Messages"
                >
                  <MessageSquare className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-white">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>
              </Link>
            )}

            {/* Notification Bell - dropdown with unread count */}
            {!authLoading && user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="relative p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100"
                    aria-label="Notifications"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-0.5 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-white">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </button>
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

            <Link href="/auth" className="hidden sm:inline-block">
              <Button variant="outline">Become a Seller</Button>
            </Link>
            <Link href="/auth" className="hidden sm:inline-block">
              <Button className="bg-gray-900 hover:bg-gray-800 text-white">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
