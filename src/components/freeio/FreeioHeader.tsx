"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FreeioHeader() {
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
              href="/browse-jobs"
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
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-600 hover:text-gray-900">
              <Search className="h-5 w-5" />
            </button>
            <Button variant="outline" className="hidden sm:inline-flex">
              Become a Seller
            </Button>
            <Button className="bg-gray-900 hover:bg-gray-800 text-white">
              Login
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
