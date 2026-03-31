"use client";

import { useEffect } from "react";
import Link from "next/link";
import AppHeader from "@/components/AppHeader";
import ReferralFooter from "@/components/referral/ReferralFooter";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Handshake,
  Shield,
  Sparkles,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";

const customerRows = [
  {
    title: "Matched professionals",
    detail: "Sample matches in your area within 48 hours of signup (demo data).",
    badge: "Avg. 3 matches",
  },
  {
    title: "Secure escrow-style payments",
    detail: "Pay milestones through the platform with dispute-friendly holds.",
    badge: "PCI-ready flow",
  },
  {
    title: "Referral transparency",
    detail: "See who referred you and how fees are split before you commit.",
    badge: "Full breakdown",
  },
];

const senderRows = [
  {
    title: "Tiered commission pools",
    detail: "Dummy tiers: Bronze 4%, Silver 6%, Gold 8% on closed deals.",
    badge: "Up to 8%",
  },
  {
    title: "Instant lead routing",
    detail: "Leads auto-notify your chosen agencies; SLA clock starts on accept.",
    badge: "< 2h demo SLA",
  },
  {
    title: "Portfolio dashboard",
    detail: "Track open referrals, payouts, and clawback windows in one view.",
    badge: "12 active (sample)",
  },
];

const recipientRows = [
  {
    title: "Pre-qualified introductions",
    detail: "Receivers get context packs: budget range, timeline, and intent score.",
    badge: "Score 0–100",
  },
  {
    title: "Revenue share on close",
    detail: "Illustrative split: 70% receiver firm / 20% sender / 10% platform.",
    badge: "Configurable",
  },
  {
    title: "Exclusivity windows",
    detail: "Demo rule: 30-day exclusive on accepted referrals in your territory.",
    badge: "30 days",
  },
];

function scrollToHash() {
  const id = window.location.hash.replace(/^#/, "");
  if (!id) return;
  requestAnimationFrame(() => {
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

export default function ReferralBenefitsPage() {
  useEffect(() => {
    scrollToHash();
    window.addEventListener("hashchange", scrollToHash);
    return () => window.removeEventListener("hashchange", scrollToHash);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <AppHeader />
      <main className="flex-1">
        <section className="border-b bg-gradient-to-r from-[#8B4513]/10 via-[#A0522D]/10 to-[#DEB887]/20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
            <Link
              href="/referral"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to referral home
            </Link>
            <div className="max-w-3xl space-y-4">
              <Badge variant="secondary" className="w-fit">
                Benefits program
              </Badge>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
                Benefits for every role
              </h1>
              <p className="text-lg text-gray-600">
                Overview of how customers, senders, and receivers benefit from
                the network. Figures below are illustrative placeholders for
                demos and UX reviews.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <Button asChild variant="outline" size="sm">
                  <a href="#customer">CUSTOMER</a>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <a href="#sender">SENDER</a>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <a href="#recipient">RECEIVER</a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section
          id="customer"
          className="scroll-mt-24 border-b py-14 sm:py-16 bg-white"
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-purple-700">
                  <Users className="h-6 w-6" />
                  <span className="text-sm font-semibold uppercase tracking-wide">
                    Customer
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Built for people finding trusted help
                </h2>
                <p className="text-gray-600 max-w-2xl">
                  Dummy highlights show the story your product team can replace
                  with live metrics from Supabase or analytics.
                </p>
              </div>
              <Card className="sm:w-64 border-purple-200/80 bg-purple-50/50">
                <CardContent className="pt-6">
                  <p className="text-xs font-medium text-purple-800 uppercase">
                    Sample stat
                  </p>
                  <p className="text-3xl font-bold text-purple-950">4.8★</p>
                  <p className="text-sm text-purple-900/80">
                    from 120 demo reviews
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {customerRows.map((row) => (
                <Card key={row.title}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg">{row.title}</CardTitle>
                      <Badge variant="outline" className="shrink-0">
                        {row.badge}
                      </Badge>
                    </div>
                    <CardDescription>{row.detail}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Shield className="h-4 w-4" />
                      <span>Demo disclosure: not a live guarantee.</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section
          id="sender"
          className="scroll-mt-24 border-b py-14 sm:py-16 bg-gray-50/80"
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-blue-700">
                  <TrendingUp className="h-6 w-6" />
                  <span className="text-sm font-semibold uppercase tracking-wide">
                    Sender
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Reward referrals that close
                </h2>
                <p className="text-gray-600 max-w-2xl">
                  Placeholder commission storyboards you can wire to real
                  referral_fee_cents later.
                </p>
              </div>
              <Card className="sm:w-64 border-blue-200/80 bg-blue-50/50">
                <CardContent className="pt-6 space-y-1">
                  <p className="text-xs font-medium text-blue-800 uppercase">
                    YTD (sample)
                  </p>
                  <p className="text-3xl font-bold text-blue-950">$24,500</p>
                  <p className="text-sm text-blue-900/80">
                    cumulative dummy payouts
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {senderRows.map((row) => (
                <Card key={row.title}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg">{row.title}</CardTitle>
                      <Badge variant="outline" className="shrink-0">
                        {row.badge}
                      </Badge>
                    </div>
                    <CardDescription>{row.detail}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Wallet className="h-4 w-4" />
                      <span>Illustrative numbers only.</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section
          id="recipient"
          className="scroll-mt-24 py-14 sm:py-16 bg-white"
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-emerald-700">
                  <Handshake className="h-6 w-6" />
                  <span className="text-sm font-semibold uppercase tracking-wide">
                    Receiver
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Grow with warm introductions
                </h2>
                <p className="text-gray-600 max-w-2xl">
                  Dummy pipeline fields mirror what agencies expect in a CRM
                  handoff.
                </p>
              </div>
              <Card className="sm:w-64 border-emerald-200/80 bg-emerald-50/50">
                <CardContent className="pt-6 space-y-1">
                  <p className="text-xs font-medium text-emerald-800 uppercase">
                    Pipeline (sample)
                  </p>
                  <p className="text-3xl font-bold text-emerald-950">18</p>
                  <p className="text-sm text-emerald-900/80">
                    open qualified intros
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {recipientRows.map((row) => (
                <Card key={row.title}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg">{row.title}</CardTitle>
                      <Badge variant="outline" className="shrink-0">
                        {row.badge}
                      </Badge>
                    </div>
                    <CardDescription>{row.detail}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Sparkles className="h-4 w-4" />
                      <span>Replace with live CRM sync.</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-12 flex flex-wrap justify-center gap-4">
              <Button asChild>
                <Link href="/register">Get started</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/referral">Explore referral home</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <ReferralFooter />
    </div>
  );
}
