"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useInvestorCompliance, useUpsertInvestorCompliance } from "@/hooks/use-compliance";
import { Loader2, ShieldCheck } from "lucide-react";

interface InvestorComplianceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
  onComplete?: () => void;
}

export function InvestorComplianceDialog({
  open,
  onOpenChange,
  userId,
  onComplete,
}: InvestorComplianceDialogProps) {
  const { data: compliance } = useInvestorCompliance(userId);
  const upsert = useUpsertInvestorCompliance(userId);
  const [annualIncome, setAnnualIncome] = useState("");
  const [netWorth, setNetWorth] = useState("");
  const [isAccredited, setIsAccredited] = useState(false);

  useEffect(() => {
    if (compliance) {
      setAnnualIncome(
        compliance.annual_income_cents != null
          ? String(Math.round(compliance.annual_income_cents / 100))
          : ""
      );
      setNetWorth(
        compliance.net_worth_cents != null
          ? String(Math.round(compliance.net_worth_cents / 100))
          : ""
      );
      setIsAccredited(compliance.is_accredited);
    } else {
      setAnnualIncome("");
      setNetWorth("");
      setIsAccredited(false);
    }
  }, [compliance]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    const incomeCents = annualIncome ? Math.round(parseFloat(annualIncome) * 100) : null;
    const netWorthCents = netWorth ? Math.round(parseFloat(netWorth) * 100) : null;
    if (!isAccredited && (incomeCents == null || netWorthCents == null)) {
      return;
    }
    await upsert.mutateAsync({
      annual_income_cents: incomeCents,
      net_worth_cents: netWorthCents,
      is_accredited: isAccredited,
    });
    onComplete?.();
    onOpenChange(false);
  };

  const canSubmit =
    isAccredited || (annualIncome && parseFloat(annualIncome) >= 0 && netWorth && parseFloat(netWorth) >= 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            Investor Profile (JOBS Act / Reg CF)
          </DialogTitle>
          <DialogDescription>
            To invest in crowdfunding projects, we need to verify your eligibility under Regulation
            Crowdfunding. This information is used to calculate your investment limit.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="accredited"
                checked={isAccredited}
                onCheckedChange={(v) => setIsAccredited(!!v)}
              />
              <Label htmlFor="accredited" className="font-normal cursor-pointer">
                I am an accredited investor
              </Label>
            </div>
            <p className="text-xs text-muted-foreground">
              Accredited investors have higher investment limits. You may self-certify.
            </p>
          </div>
          {!isAccredited && (
            <>
              <div className="space-y-2">
                <Label htmlFor="income">Annual income (USD)</Label>
                <Input
                  id="income"
                  type="number"
                  min="0"
                  step="1000"
                  placeholder="e.g. 75000"
                  value={annualIncome}
                  onChange={(e) => setAnnualIncome(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="networth">Net worth (USD)</Label>
                <Input
                  id="networth"
                  type="number"
                  min="0"
                  step="1000"
                  placeholder="e.g. 150000"
                  value={netWorth}
                  onChange={(e) => setNetWorth(e.target.value)}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Reg CF limits: 5% of greater of income/net worth (or 10% if both &gt; $124k), max
                $124k/year.
              </p>
            </>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit || upsert.isPending}>
              {upsert.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
