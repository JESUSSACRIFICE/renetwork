"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import AppHeader from "@/components/AppHeader";
import Footer from "@/components/Footer";

export default function NetworkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { href: "/network/feed", label: "Feed" },
    { href: "/network/deals", label: "Deals" },
    { href: "/community", label: "Groups & Forums" },
    { href: "/dashboard/messages", label: "Messages" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <AppHeader />
      <div className="border-b bg-white">
        <div className="container max-w-4xl mx-auto px-4 py-3">
          <nav className="flex gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium",
                  pathname === item.href || (item.href !== "/community" && pathname.startsWith(item.href))
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
