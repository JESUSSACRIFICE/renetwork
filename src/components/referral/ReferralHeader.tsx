"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Bell, MessageSquare, Menu, User, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { AUTH_USER_QUERY_KEY } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

export default function ReferralHeader() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      queryClient.invalidateQueries({ queryKey: AUTH_USER_QUERY_KEY });
      toast.success("Logged out successfully");
      router.push("/referral");
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/referral/results?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  return (
    <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/referral" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-dark text-primary-foreground font-bold text-sm">
              REF
            </div>
            <span className="text-xl font-bold text-gray-900 hidden sm:block">Referral Platform</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/referral" className="text-gray-700 hover:text-gray-900 font-medium">
              Home
            </Link>
            <Link href="/referral/results" className="text-gray-700 hover:text-gray-900 font-medium">
              Browse
            </Link>
            <Link href="/referral/about" className="text-gray-700 hover:text-gray-900 font-medium">
              About
            </Link>
            <Link href="/referral/benefits" className="text-gray-700 hover:text-gray-900 font-medium">
              Benefits
            </Link>
            <Link href="/referral/qa" className="text-gray-700 hover:text-gray-900 font-medium">
              Q&A
            </Link>
            <Link href="/referral/contact" className="text-gray-700 hover:text-gray-900 font-medium">
              Contact
            </Link>
          </nav>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search services, profiles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-gray-50 border-gray-200 h-9"
              />
            </div>
          </form>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2">
            {user ? (
              <>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="hidden md:flex relative hover:bg-gray-100"
                  onClick={() => router.push("/referral/dashboard/messages")}
                >
                  <MessageSquare className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="hidden md:flex relative hover:bg-gray-100">
                  <Bell className="h-5 w-5" />
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild className="hidden lg:flex">
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          {user.email?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5 text-sm">
                      <p className="font-medium">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push("/referral/dashboard")}>
                      <User className="mr-2 h-4 w-4" />
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push("/referral/settings")}>
                      <User className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Link href="/auth">
                <Button className="bg-gray-900 hover:bg-gray-800 text-white">
                  Login
                </Button>
              </Link>
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
                  {!user && (
                    <Link href="/auth" onClick={() => setMobileOpen(false)}>
                      <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white">
                        Login
                      </Button>
                    </Link>
                  )}
                  
                  <div className="space-y-4">
                    <Link href="/referral" onClick={() => setMobileOpen(false)} className="block text-gray-700 hover:text-gray-900 font-medium">
                      Home
                    </Link>
                    <Link href="/referral/results" onClick={() => setMobileOpen(false)} className="block text-gray-700 hover:text-gray-900 font-medium">
                      Browse
                    </Link>
                    <Link href="/referral/about" onClick={() => setMobileOpen(false)} className="block text-gray-700 hover:text-gray-900 font-medium">
                      About
                    </Link>
                    <Link href="/referral/benefits" onClick={() => setMobileOpen(false)} className="block text-gray-700 hover:text-gray-900 font-medium">
                      Benefits
                    </Link>
                    <Link href="/referral/qa" onClick={() => setMobileOpen(false)} className="block text-gray-700 hover:text-gray-900 font-medium">
                      Q&A
                    </Link>
                    <Link href="/referral/contact" onClick={() => setMobileOpen(false)} className="block text-gray-700 hover:text-gray-900 font-medium">
                      Contact
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

