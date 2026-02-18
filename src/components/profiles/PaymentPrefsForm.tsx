"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, ChevronDown } from "lucide-react";
import {
  useProfile,
  useProfilePaymentPrefsUpdate,
  type ProfilePaymentPrefsPayload,
} from "@/hooks/use-professional-profiles";

interface PaymentPrefsFormProps {
  userId: string;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSaveSuccess?: (nextSection?: number) => void;
}

export function PaymentPrefsForm({
  userId,
  isOpen = true,
  onOpenChange,
  onSaveSuccess,
}: PaymentPrefsFormProps) {
  const { data: profile } = useProfile(userId);
  const updatePaymentPrefs = useProfilePaymentPrefsUpdate();

  const [paymentPrefs, setPaymentPrefs] = useState({
    accepts_cash: true,
    accepts_credit: true,
    accepts_financing: false,
    payment_packet: "",
    payment_terms: "",
  });

  useEffect(() => {
    if (!profile?.payment_preferences) return;

    const p = profile.payment_preferences;
    console.log(p);
    setPaymentPrefs({
      accepts_cash: p.accepts_cash ?? true,
      accepts_credit: p.accepts_credit ?? true,
      accepts_financing: p.accepts_financing ?? false,
      payment_packet: (p as { payment_packet?: string }).payment_packet ?? "",
      payment_terms: p.payment_terms ?? "",
    });
  }, [profile]);

  const handleSubmit = () => {
    const payload: ProfilePaymentPrefsPayload = {
      userId,
      ...paymentPrefs,
    };

    updatePaymentPrefs.mutate(payload, {
      onSuccess: () => {
        onSaveSuccess?.(7);
      },
    });
  };

  return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange} className="group">
      <Card>
        <CardHeader>
          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md hover:bg-muted/50 transition-colors">
            <CardTitle>Payment Preferences</CardTitle>
            <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="cash"
                  checked={paymentPrefs.accepts_cash}
                  onCheckedChange={(checked) =>
                    setPaymentPrefs({
                      ...paymentPrefs,
                      accepts_cash: checked as boolean,
                    })
                  }
                />
                <label htmlFor="cash" className="text-sm font-medium">
                  Accept Cash
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="credit"
                  checked={paymentPrefs.accepts_credit}
                  onCheckedChange={(checked) =>
                    setPaymentPrefs({
                      ...paymentPrefs,
                      accepts_credit: checked as boolean,
                    })
                  }
                />
                <label htmlFor="credit" className="text-sm font-medium">
                  Accept Credit Card
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="financing"
                  checked={paymentPrefs.accepts_financing}
                  onCheckedChange={(checked) =>
                    setPaymentPrefs({
                      ...paymentPrefs,
                      accepts_financing: checked as boolean,
                    })
                  }
                />
                <label htmlFor="financing" className="text-sm font-medium">
                  Accept Financing
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Payment Schedule</label>
                <Select
                  value={paymentPrefs.payment_packet}
                  onValueChange={(value) =>
                    setPaymentPrefs({
                      ...paymentPrefs,
                      payment_packet: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select schedule" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="bi-weekly">Bi-Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Payment Terms</label>
                <Input
                  value={paymentPrefs.payment_terms}
                  onChange={(e) =>
                    setPaymentPrefs({
                      ...paymentPrefs,
                      payment_terms: e.target.value,
                    })
                  }
                  placeholder="e.g., 50% upfront, 50% on completion"
                />
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={updatePaymentPrefs.isPending}
              >
                {updatePaymentPrefs.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save &amp; Continue
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
