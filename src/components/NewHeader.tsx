"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const NewHeader = () => {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigationItems = [
    { name: "Referral", href: "/referral" },
    { name: "Crowdfund", href: "/crowdfund" },
    { name: "Network", href: "/network" },
    { name: "Commerce", href: "/commerce" },
  ];

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
          {/* Notification Icon */}
          <Button
            variant="ghost"
            size="icon"
            className="relative hover:bg-accent hidden sm:flex"
            onClick={() => router.push("/notifications")}
          >
            <Bell className="h-5 w-5" />
            {/* Optional: Notification badge */}
            {/* <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span> */}
          </Button>

          {/* Login Button */}
          <Link href="/auth" className="hidden lg:block">
            <Button variant="ghost" className="h-10">
              Login
            </Button>
          </Link>

          {/* Join Network Button */}
          <Link href="/auth" className="hidden lg:block">
            <Button className="h-10 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary shadow-lg">
              Join Network
            </Button>
          </Link>

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
                  {/* Notification in Mobile */}
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
                  </Button>

                  {/* Login in Mobile */}
                  <Link href="/auth" className="block" onClick={() => setMobileOpen(false)}>
                    <Button variant="ghost" className="w-full">
                      Login
                    </Button>
                  </Link>

                  {/* Join Network in Mobile */}
                  <Link href="/auth" className="block" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full bg-gradient-to-r from-primary to-primary-dark">
                      Join Network
                    </Button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default NewHeader;

