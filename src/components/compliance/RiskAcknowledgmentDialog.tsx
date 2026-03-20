"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useAcknowledgeRisk } from "@/hooks/use-compliance";
import { AlertTriangle } from "lucide-react";

interface RiskAcknowledgmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
  onAcknowledged?: () => void;
}

const RISK_DISCLOSURE = `
Investing in crowdfunding projects involves significant risks, including the potential loss of your entire investment. These investments are illiquid and may be difficult to sell. There is no guarantee of returns, and past performance does not indicate future results.

By proceeding, you acknowledge that you have read and understand these risks, and that you are investing only what you can afford to lose. This is not an offer to sell or solicitation to buy securities. All investments are subject to SEC approval and JOBS Act compliance.
`.trim();

export function RiskAcknowledgmentDialog({
  open,
  onOpenChange,
  userId,
  onAcknowledged,
}: RiskAcknowledgmentDialogProps) {
  const [agreed, setAgreed] = useState(false);
  const acknowledge = useAcknowledgeRisk(userId);

  const handleAcknowledge = async () => {
    if (!userId || !agreed) return;
    await acknowledge.mutateAsync({ risk_acknowledged: true });
    onAcknowledged?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-600">
            <AlertTriangle className="h-5 w-5" />
            Investment Risk Disclosure
          </DialogTitle>
          <DialogDescription>
            Please read and acknowledge before investing
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4 text-sm text-amber-900">
            {RISK_DISCLOSURE}
          </div>
          <div className="flex items-start space-x-2">
            <Checkbox
              id="ack"
              checked={agreed}
              onCheckedChange={(v) => setAgreed(!!v)}
            />
            <Label htmlFor="ack" className="font-normal cursor-pointer text-sm leading-tight">
              I have read and understand the risks. I acknowledge that I am investing at my own risk
              and that this platform does not guarantee any returns.
            </Label>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAcknowledge}
            disabled={!agreed || acknowledge.isPending}
          >
            {acknowledge.isPending ? "Saving..." : "I Acknowledge"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
