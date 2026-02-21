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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText } from "lucide-react";
import { toast } from "sonner";

interface SendOfferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipientId: string;
  recipientName: string;
  onSend: (params: {
    title: string;
    description?: string;
    amountCents: number;
    deliveryDays?: number;
  }) => Promise<void>;
  isSending?: boolean;
}

export function SendOfferDialog({
  open,
  onOpenChange,
  recipientId,
  recipientName,
  onSend,
  isSending = false,
}: SendOfferDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amountStr, setAmountStr] = useState("");
  const [deliveryDaysStr, setDeliveryDaysStr] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(amountStr);
    if (!title.trim()) {
      toast.error("Please enter an offer title");
      return;
    }
    if (isNaN(amount) || amount < 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    const amountCents = Math.round(amount * 100);
    const deliveryDays = deliveryDaysStr ? parseInt(deliveryDaysStr, 10) : undefined;
    if (deliveryDays !== undefined && (isNaN(deliveryDays) || deliveryDays < 1)) {
      toast.error("Estimated days must be at least 1");
      return;
    }
    try {
      await onSend({
        title: title.trim(),
        description: description.trim() || undefined,
        amountCents,
        deliveryDays: deliveryDays ?? undefined,
      });
      toast.success("Offer sent!");
      setTitle("");
      setDescription("");
      setAmountStr("");
      setDeliveryDaysStr("");
      onOpenChange(false);
    } catch {
      // Error handled in hook
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setTitle("");
      setDescription("");
      setAmountStr("");
      setDeliveryDaysStr("");
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Send Offer to {recipientName.split(" ")[0]}
          </DialogTitle>
          <DialogDescription>
            Propose a service with a title, description, and price. The client can accept or decline.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="offer-title">Title *</Label>
            <Input
              id="offer-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Home Inspection"
              required
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="offer-description">Description</Label>
            <Textarea
              id="offer-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the scope of work..."
              rows={3}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="offer-amount">Amount ($) *</Label>
            <Input
              id="offer-amount"
              type="number"
              min="0"
              step="0.01"
              value={amountStr}
              onChange={(e) => setAmountStr(e.target.value)}
              placeholder="0.00"
              required
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="offer-delivery-days">Estimated delivery (days)</Label>
            <Input
              id="offer-delivery-days"
              type="number"
              min="1"
              value={deliveryDaysStr}
              onChange={(e) => setDeliveryDaysStr(e.target.value)}
              placeholder="e.g. 5"
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Timeline will be shown based on this estimate when the offer is accepted.
            </p>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSending || !title.trim() || !amountStr}>
              {isSending ? "Sending..." : "Send Offer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
