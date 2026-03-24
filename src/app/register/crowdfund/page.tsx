"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AppHeader from "@/components/AppHeader";

type Testimonial = {
  id: string;
  name: string;
  timestamp: string;
  location: string;
  pledgeType: string;
  amount: string;
  quote: string;
};

export default function CrowdfundRegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    time: "",
    date: "",
    address: "",
    phone: "",
    disclosureAddressHidden: false,
    disclosurePhoneHidden: false,
    viewStats: true,
    amount: "30.00",
  });
  const realTestimonials: Testimonial[] = [];
  const dummyTestimonials: Testimonial[] = [
    {
      id: "t1",
      name: "Marlon Reyes",
      timestamp: "2026-03-23T12:33:00",
      location: "Cebu, PH",
      pledgeType: "Donated",
      amount: "$130.00",
      quote:
        "I started with a small monthly pledge and the process was clear from day one. I like that I can track pledge activity and stay consistent.",
    },
    {
      id: "t2",
      name: "Tina Walters",
      timestamp: "2026-03-16T11:18:00",
      location: "Houston, TX",
      pledgeType: "Donated",
      amount: "$150.00",
      quote:
        "The platform made it easy to commit and keep my schedule. Support was responsive, and the pledge dashboard gave me confidence.",
    },
    {
      id: "t3",
      name: "Joel Patrick",
      timestamp: "2026-03-02T16:55:00",
      location: "Calgary, CA",
      pledgeType: "Donated",
      amount: "$400.00",
      quote:
        "I wanted something structured and simple. Registration was quick, and I appreciated seeing clear terms before confirming.",
    },
  ];
  const testimonials =
    realTestimonials.length > 0 ? realTestimonials : dummyTestimonials;

  const formatTime = (timestamp: string) =>
    new Date(timestamp).toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  const formatDate = (timestamp: string) =>
    new Date(timestamp).toLocaleDateString(undefined, {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);

    if (diffSeconds < 60) return "just now";

    const units = [
      { label: "year", seconds: 60 * 60 * 24 * 365 },
      { label: "month", seconds: 60 * 60 * 24 * 30 },
      { label: "week", seconds: 60 * 60 * 24 * 7 },
      { label: "day", seconds: 60 * 60 * 24 },
      { label: "hour", seconds: 60 * 60 },
      { label: "minute", seconds: 60 },
    ];

    for (const unit of units) {
      const value = Math.floor(diffSeconds / unit.seconds);
      if (value >= 1) {
        return `${value} ${unit.label}${value === 1 ? "" : "s"} ago`;
      }
    }

    return "just now";
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    router.push("/auth?redirect=%2Fcrowdfund");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10">
      <AppHeader />
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            Crowdfund Registration
          </h1>
          <p className="mt-2 text-muted-foreground">
            Fill out your crowdfunding registration details to continue.
          </p>
        </div>

        <Card className="border-primary/20 shadow-sm">
          <CardHeader>
            <CardTitle>Registration Form</CardTitle>
          </CardHeader>
          <CardContent className="max-h-[34vh] overflow-y-auto pr-3">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    placeholder="Phone number"
                    required
                  />
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={formData.disclosurePhoneHidden}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          disclosurePhoneHidden: e.target.checked,
                        }))
                      }
                    />
                    <span>Don&apos;t Show Phone</span>
                  </label>
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, time: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, date: e.target.value }))
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, address: e.target.value }))
                  }
                  placeholder="Street, city, state"
                  required
                />
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.disclosureAddressHidden}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        disclosureAddressHidden: e.target.checked,
                      }))
                    }
                  />
                  <span>Don&apos;t Show Address</span>
                </label>
              </div>

              <div className="rounded-lg border p-4 space-y-4">
                <h3 className="font-medium">View Stats</h3>

                <div className="space-y-2">
                  <Label htmlFor="amount">
                    Amount: Unanimous or enter any amount (Month, Tithe,
                    Platform)
                  </Label>
                  <Input
                    id="amount"
                    type="text"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        amount: e.target.value,
                      }))
                    }
                    placeholder="e.g. 30.00"
                    required
                  />
                </div>

                <p className="text-sm text-muted-foreground">
                  Pledger 2,345,678 of 2.4 B+
                </p>
              </div>

              <div className="rounded-md border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-200">
                Note: All crowdfunding pledge payments are non-refundable.
              </div>

              <div>
                <Button type="submit" className="w-full">
                  Continue to Register
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="border-primary/20 shadow-sm">
          <CardHeader>
            <CardTitle>Testimonials from Previous Pledgers</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {testimonials.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border bg-card p-4 space-y-2 shadow-sm"
              >
                <div className="pb-2 border-b">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground whitespace-nowrap text-right">
                      {formatTime(item.timestamp)}, {formatDate(item.timestamp)},{" "}<br/>
                      ({(formatTimeAgo(item.timestamp))})
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {item.pledgeType} - {item.amount}
                  </p>
                  <p className="text-xs text-muted-foreground">{item.location}</p>
                </div>
                <p className="text-sm text-muted-foreground">&quot;{item.quote}&quot;</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
