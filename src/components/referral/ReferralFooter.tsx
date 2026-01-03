"use client";

import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

const footerLinks = {
  Platform: [
    { name: "Browse Services", href: "/referral/results?type=service" },
    { name: "Browse Profiles", href: "/referral/results?type=profile" },
    { name: "Browse Agencies", href: "/referral/results?type=agency" },
    { name: "How It Works", href: "/referral/about#how-it-works" },
  ],
  Resources: [
    { name: "Benefits", href: "/referral/benefits" },
    { name: "Q&A", href: "/referral/qa" },
    { name: "About Us", href: "/referral/about" },
    { name: "Contact", href: "/referral/contact" },
  ],
  Legal: [
    { name: "Terms of Service", href: "/referral/learn/tos" },
    { name: "Privacy Policy", href: "/referral/learn/privacy" },
    { name: "Legal Disclosures", href: "/referral/learn/legal" },
    { name: "Platform Exclusivity", href: "/referral/learn/exclusivity" },
  ],
  Account: [
    { name: "Dashboard", href: "/referral/dashboard" },
    { name: "Register", href: "/referral/register" },
    { name: "Settings", href: "/referral/settings" },
    { name: "Advertise", href: "/referral/advertise" },
  ],
};

export default function ReferralFooter() {
  return (
    <footer className="w-full bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-8">
          {/* Logo and Contact */}
          <div className="col-span-2 lg:col-span-1">
            <h3 className="text-2xl font-bold text-white mb-4">Referral Platform</h3>
            <p className="text-sm mb-4">Customer Care</p>
            <p className="text-lg font-semibold text-white mb-2">+1 234 567 890</p>
            <Link href="/referral/contact" className="text-sm hover:text-white">
              Need help?
            </Link>
          </div>

          {/* Footer Links Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-white font-semibold mb-4">{title}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-sm hover:text-white transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Subscribe Section */}
        <div className="border-t border-gray-800 pt-8 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-white font-semibold mb-2">Subscribe</h4>
              <p className="text-sm">Get the latest news and updates</p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
              />
              <Button className="bg-gray-800 hover:bg-gray-700 text-white">Send</Button>
            </div>
          </div>
        </div>

        {/* Social Media and Copyright */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm">
              © Referral Platform 2024. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <div className="flex gap-4">
                <Link href="#" className="hover:text-white transition-colors">
                  <Facebook className="h-5 w-5" />
                </Link>
                <Link href="#" className="hover:text-white transition-colors">
                  <Twitter className="h-5 w-5" />
                </Link>
                <Link href="#" className="hover:text-white transition-colors">
                  <Instagram className="h-5 w-5" />
                </Link>
                <Link href="#" className="hover:text-white transition-colors">
                  <Linkedin className="h-5 w-5" />
                </Link>
              </div>
              <select className="bg-gray-800 border-gray-700 text-white text-sm px-3 py-1 rounded">
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

