"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Bell,
  MessageSquare,
  Menu,
  Building2,
  Home,
  DollarSign,
  Hammer,
  FileText,
  Scale,
  Users,
  User,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, AUTH_USER_QUERY_KEY } from "@/hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";
import { useUnreadCount } from "@/hooks/use-messages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

const Header = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { unreadCount } = useUnreadCount(user?.id ?? null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      queryClient.invalidateQueries({ queryKey: AUTH_USER_QUERY_KEY });
      toast.success("Logged out successfully");
      router.push("/");
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search/services?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  const professionalServices = [
    {
      icon: Home,
      name: "Real Estate Agents",
      href: "/search/services?category=agents",
      subcategories: ["Residential", "Commercial", "Luxury", "Investment"],
    },
    {
      icon: DollarSign,
      name: "Mortgage Consultants",
      href: "/search/services?category=mortgage",
      subcategories: [
        "FHA Loans",
        "Commercial Loans",
        "VA Loans",
        "Refinancing",
      ],
    },
    {
      icon: Scale,
      name: "Real Estate Attorneys",
      href: "/search/services?category=attorney",
      subcategories: [
        "Title",
        "Foreclosure",
        "Contract Law",
        "Real Estate Litigation",
      ],
    },
    {
      icon: FileText,
      name: "Escrow Officers",
      href: "/search/services?category=escrow",
      subcategories: [
        "Title Insurance",
        "Closing Services",
        "Escrow Management",
      ],
    },
  ];

  const tradeServices = [
    {
      icon: Hammer,
      name: "General Contractors",
      href: "/search/services?category=contractors",
      subcategories: [
        "New Construction",
        "Renovations",
        "Remodeling",
        "Commercial",
      ],
    },
    {
      icon: Building2,
      name: "Property Inspectors",
      href: "/search/services?category=inspectors",
      subcategories: [
        "Home Inspection",
        "Commercial",
        "Pre-Purchase",
        "Maintenance",
      ],
    },
  ];

  const propertyTypes = [
    { name: "Residential", href: "/search/services?type=residential" },
    { name: "Commercial", href: "/search/services?type=commercial" },
    { name: "Multi-Unit (4+)", href: "/search/services?type=multi-unit" },
    { name: "Industrial", href: "/search/services?type=industrial" },
    { name: "Agricultural", href: "/search/services?type=agricultural" },
    { name: "Land Development", href: "/search/services?type=land" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/90 shadow-sm">
      <div className="container flex h-20 items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-3 shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-dark text-primary-foreground font-bold text-lg shadow-lg">
            RE
          </div>
          <span className="font-bold text-xl hidden sm:block">RE Network</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center">
          <NavigationMenu>
            <NavigationMenuList className="gap-1">
              {/* Professional Services */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="h-10 px-4 text-base bg-primary/5 hover:bg-primary/10">
                  <Users className="h-4 w-4 mr-2" />
                  Professional Services
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid grid-cols-2 gap-4 p-6 w-[600px] bg-card">
                    {professionalServices.map((service) => (
                      <Link
                        key={service.name}
                        href={service.href}
                        className="group block space-y-2 rounded-lg p-4 hover:bg-accent transition-all duration-300"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                            <service.icon className="h-5 w-5" />
                          </div>
                          <span className="font-semibold text-sm group-hover:text-primary transition-colors">
                            {service.name}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 pl-13">
                          {service.subcategories.slice(0, 2).map((sub) => (
                            <span
                              key={sub}
                              className="text-xs text-muted-foreground"
                            >
                              {sub}
                            </span>
                          ))}
                        </div>
                      </Link>
                    ))}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Trade Services */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="h-10 px-4">
                  Trade Services
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid w-[400px] gap-3 p-4">
                    {tradeServices.map((service) => (
                      <Link
                        key={service.name}
                        href={service.href}
                        className="group block space-y-1 rounded-lg p-4 hover:bg-accent transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <service.icon className="h-5 w-5 text-primary" />
                          <span className="font-semibold text-sm">
                            {service.name}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground pl-8">
                          {service.subcategories.join(", ")}
                        </div>
                      </Link>
                    ))}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Property Types */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="h-10 px-4">
                  Property Types
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid grid-cols-2 w-[400px] gap-2 p-4">
                    {propertyTypes.map((type) => (
                      <Link
                        key={type.name}
                        href={type.href}
                        className="block px-4 py-2 rounded-lg hover:bg-accent transition-colors text-sm"
                      >
                        {type.name}
                      </Link>
                    ))}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Pages */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="h-10 px-4">
                  Pages
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid w-[300px] gap-2 p-4">
                    <Link
                      href="/community"
                      className="block px-4 py-2 rounded-lg hover:bg-accent transition-colors text-sm"
                    >
                      Community & Forums
                    </Link>
                    <Link
                      href="/tools"
                      className="block px-4 py-2 rounded-lg hover:bg-accent transition-colors text-sm"
                    >
                      Real Estate Tools
                    </Link>
                    <Link
                      href="/about"
                      className="block px-4 py-2 rounded-lg hover:bg-accent transition-colors text-sm"
                    >
                      About Network
                    </Link>
                    <Link
                      href="/training"
                      className="block px-4 py-2 rounded-lg hover:bg-accent transition-colors text-sm"
                    >
                      Training Programs
                    </Link>
                    <Link
                      href="/help"
                      className="block px-4 py-2 rounded-lg hover:bg-accent transition-colors text-sm"
                    >
                      Help Center
                    </Link>
                    <Link
                      href="/contact"
                      className="block px-4 py-2 rounded-lg hover:bg-accent transition-colors text-sm"
                    >
                      Contact
                    </Link>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Referral Platform */}
              <NavigationMenuItem>
                <Link href="/referral">
                  <Button variant="ghost" className="h-10 px-4">
                    Referral Platform
                  </Button>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </nav>

        {/* Search Bar - Desktop */}
        <form
          onSubmit={handleSearch}
          className="hidden md:flex flex-1 max-w-md"
        >
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search professionals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-muted/50 border-0 h-11 focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>
        </form>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="hidden md:flex relative hover:bg-accent"
                onClick={() => router.push("/dashboard/messages")}
              >
                <MessageSquare className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="hidden md:flex relative hover:bg-accent"
              >
                <Bell className="h-5 w-5" />
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild className="hidden lg:flex">
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary text-primary-foreground">
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
                  <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                    <User className="mr-2 h-4 w-4" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push(`/profile/${user.id}`)}
                  >
                    <User className="mr-2 h-4 w-4" />
                    My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push(`/profile/${user.id}/edit`)}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Edit Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push("/dashboard/messages")}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Messages
                    {unreadCount > 0 && (
                      <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-medium text-primary-foreground">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
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
            <>
              <Link href="/auth" className="hidden lg:block">
                <Button variant="ghost" className="h-10">
                  Login
                </Button>
              </Link>
              <Link href="/auth" className="hidden lg:block">
                <Button className="h-10 bg-gradient-to-r from-secondary to-secondary-dark hover:from-secondary-dark hover:to-secondary shadow-lg">
                  Join Network
                </Button>
              </Link>
            </>
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
                <Link href="/auth" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full bg-gradient-to-r from-secondary to-secondary-dark">
                    Join Network
                  </Button>
                </Link>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">
                    Professional Services
                  </h3>
                  {professionalServices.map((service) => (
                    <Link
                      key={service.name}
                      href={service.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
                    >
                      <service.icon className="h-5 w-5 text-primary" />
                      <span>{service.name}</span>
                    </Link>
                  ))}

                  <h3 className="font-semibold text-lg mt-6">Trade Services</h3>
                  {tradeServices.map((service) => (
                    <Link
                      key={service.name}
                      href={service.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
                    >
                      <service.icon className="h-5 w-5 text-primary" />
                      <span>{service.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
