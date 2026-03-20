"use client";

import AppHeader from "@/components/AppHeader";
import Footer from "@/components/Footer";
import { Target, Heart, Shield, Users, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ReasonPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <main className="flex-1">
        <section className="container py-16 px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Why RE Network Exists</h1>
            <p className="text-xl text-muted-foreground">
              Where faith, finance, and future connect.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="p-6 rounded-xl border bg-card">
              <Target className="h-10 w-10 text-primary mb-4" />
              <h2 className="text-xl font-semibold mb-2">Your Trusted Team</h2>
              <p className="text-muted-foreground">
                No more guessing who&apos;s active or who to trust. Connect with
                vetted real estate professionals ready to send and receive
                referrals.
              </p>
            </div>
            <div className="p-6 rounded-xl border bg-card">
              <Heart className="h-10 w-10 text-primary mb-4" />
              <h2 className="text-xl font-semibold mb-2">Values-Aligned</h2>
              <p className="text-muted-foreground">
                Faith-based recreation, entertainment, and investment
                opportunities that honor God. Community-driven and transparent.
              </p>
            </div>
            <div className="p-6 rounded-xl border bg-card">
              <Shield className="h-10 w-10 text-primary mb-4" />
              <h2 className="text-xl font-semibold mb-2">Pre-Vetted Experts</h2>
              <p className="text-muted-foreground">
                Every professional is verified. Performance tracked. Right pro
                for your specific need—investors, agents, lenders, contractors,
                property managers.
              </p>
            </div>
            <div className="p-6 rounded-xl border bg-card">
              <Users className="h-10 w-10 text-primary mb-4" />
              <h2 className="text-xl font-semibold mb-2">Deal Flow Source</h2>
              <p className="text-muted-foreground">
                The Facebook, LinkedIn for real estate—but actually making deals
                happen. Find JV partners, off-market opportunities, and expert
                referrals.
              </p>
            </div>
            <div className="p-6 rounded-xl border bg-card">
              <Zap className="h-10 w-10 text-primary mb-4" />
              <h2 className="text-xl font-semibold mb-2">Earn While You Refer</h2>
              <p className="text-muted-foreground">
                Get paid for referring others. Get trained when you refer. Build
                your portfolio and professional circle in one place.
              </p>
            </div>
            <div className="p-6 rounded-xl border bg-card flex flex-col justify-center">
              <p className="text-lg font-medium mb-4">
                Stop jumping between disconnected platforms.
              </p>
              <p className="text-muted-foreground mb-6">
                Everything you need to succeed in real estate, now in one place
                built on Christian values.
              </p>
              <Link href="/register">
                <Button size="lg">Choose Your Starting Point</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
