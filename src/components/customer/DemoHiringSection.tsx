import Link from "next/link";
import { Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/** Layout samples only. These are not live requisitions. */
const DEMO_OPENINGS = [
  {
    role: "Commercial real estate agent",
    office: "Central Valley office",
    summary:
      "Sample of how a customer would see an office hiring for property work.",
  },
  {
    role: "Property service coordinator",
    office: "Branch office",
    summary:
      "Placeholder for referral-project staffing. Nothing here is an open role.",
  },
  {
    role: "Trades lead",
    office: "Field office",
    summary:
      "Shows hiring from trades through professionals. Applications are not collected.",
  },
] as const;

export function DemoHiringSection({
  id = "hiring",
  className = "",
}: {
  id?: string;
  className?: string;
}) {
  return (
    <section id={id} className={className}>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary">
            <Briefcase className="h-5 w-5" aria-hidden />
            <span className="text-sm font-semibold uppercase tracking-wide">
              Hiring
            </span>
          </div>
          <h3 className="text-2xl font-bold text-foreground">
            Offices hiring for property and referral projects
          </h3>
          <p className="max-w-2xl text-muted-foreground">
            Customer touchpoint for browsing how branches and offices can list
            work. Every card below is labeled Demo. There are no live jobs in
            this slice, and this page does not take applications.
          </p>
        </div>
        <Button asChild variant="outline" className="shrink-0">
          <Link href="/search/agencies">Browse offices</Link>
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {DEMO_OPENINGS.map((opening) => (
          <Card key={opening.role} className="h-full">
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-lg">{opening.role}</CardTitle>
                <Badge variant="outline" className="shrink-0">
                  Demo
                </Badge>
              </div>
              <CardDescription>{opening.office}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{opening.summary}</p>
              <p className="mt-3 text-xs font-medium uppercase tracking-wide text-amber-900">
                Demo listing · not a live opening
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
