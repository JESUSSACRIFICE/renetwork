"use client";

import AppHeader from "@/components/AppHeader";
import Footer from "@/components/Footer";
import { CheckCircle2, Circle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function StagesPage() {
  const phases = [
    {
      name: "Phase 1",
      title: "MVP – Referral & Discovery",
      status: "complete",
      items: [
        "Landing page, hero, vertical menu",
        "Search by Service, Profile, Agency",
        "User roles: Investor, PSP, Customer, Admin",
        "Referral submission & tracking",
        "PSP profile approval workflow",
        "Admin: Approvals, Analytics, Disputes",
        "Empty states & feedback loops",
      ],
    },
    {
      name: "Phase 2",
      title: "Crowdfunding & Compliance",
      status: "complete",
      items: [
        "Crowdfunding pledge list (pre-SEC)",
        "JOBS Act compliance",
        "Investor risk acknowledgment",
        "Admin project approval",
      ],
    },
    {
      name: "Phase 3",
      title: "Networking & Community",
      status: "in_progress",
      items: [
        "Groups, forums, posts",
        "Community voting",
        "Deal-focused profiles",
        "Secure messaging",
      ],
    },
    {
      name: "Phase 4",
      title: "Monetization & Scale",
      status: "planned",
      items: [
        "Escrow & payments",
        "Memberships (Free vs Premium)",
        "Ad server & promotions",
        "Advanced analytics",
      ],
    },
    {
      name: "Phase 5",
      title: "Growth & Optimization",
      status: "planned",
      items: [
        "AI matching (when approved)",
        "Automated payouts",
        "Recommendation engines",
        "Mobile optimization",
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <main className="flex-1">
        <section className="container py-16 px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Stages & Phases</h1>
            <p className="text-xl text-muted-foreground">
              RE Network development roadmap—from MVP to full platform.
            </p>
          </div>

          <div className="max-w-2xl mx-auto space-y-8">
            {phases.map((phase) => (
              <div
                key={phase.name}
                className="border rounded-xl p-6 bg-card"
              >
                <div className="flex items-center gap-3 mb-4">
                  {phase.status === "complete" ? (
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  ) : phase.status === "in_progress" ? (
                    <Circle className="h-8 w-8 text-primary fill-primary/20" />
                  ) : (
                    <Circle className="h-8 w-8 text-muted-foreground" />
                  )}
                  <div>
                    <h2 className="text-xl font-semibold">{phase.name}</h2>
                    <p className="text-muted-foreground">{phase.title}</p>
                  </div>
                  <span className="ml-auto text-sm font-medium uppercase tracking-wide text-muted-foreground">
                    {phase.status.replace("_", " ")}
                  </span>
                </div>
                <ul className="space-y-2">
                  {phase.items.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <ArrowRight className="h-4 w-4 text-primary shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/">
              <Button variant="outline" size="lg">
                Back to Home
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
