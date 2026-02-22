"use client";

import { Briefcase, MapPin, DollarSign, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProfileDealInterests, useAddDealInterest } from "@/hooks/use-networking";
import type { ProfileDealInterest } from "@/lib/networking-types";
import { useState } from "react";
import { toast } from "sonner";

const INTEREST_LABELS: Record<string, string> = {
  buy: "Looking to Buy",
  sell: "Looking to Sell",
  jv: "JV Opportunity",
  partner: "Seeking Partner",
};

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function ProfileDealInterests({
  profileId,
  isOwner,
}: {
  profileId: string;
  isOwner: boolean;
}) {
  const { data: interests } = useProfileDealInterests(profileId);
  const addInterest = useAddDealInterest(profileId, isOwner ? profileId : null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    interest_type: "buy" as const,
    title: "",
    description: "",
    property_type: "",
    location: "",
    budget_min: "",
    budget_max: "",
  });

  const handleAdd = () => {
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    addInterest.mutate(
      {
        interest_type: form.interest_type,
        title: form.title,
        description: form.description || undefined,
        property_type: form.property_type || undefined,
        location: form.location || undefined,
        budget_min_cents: form.budget_min ? Math.round(parseFloat(form.budget_min) * 100) : undefined,
        budget_max_cents: form.budget_max ? Math.round(parseFloat(form.budget_max) * 100) : undefined,
      },
      {
        onSuccess: () => {
          toast.success("Deal interest added");
          setForm({
            interest_type: "buy",
            title: "",
            description: "",
            property_type: "",
            location: "",
            budget_min: "",
            budget_max: "",
          });
          setDialogOpen(false);
        },
        onError: () => toast.error("Failed to add"),
      }
    );
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Deal Interests</h2>
          {isOwner && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add deal interest</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Type</Label>
                    <Select
                      value={form.interest_type}
                      onValueChange={(v) =>
                        setForm((p) => ({ ...p, interest_type: v as ProfileDealInterest["interest_type"] }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="buy">Looking to Buy</SelectItem>
                        <SelectItem value="sell">Looking to Sell</SelectItem>
                        <SelectItem value="jv">JV Opportunity</SelectItem>
                        <SelectItem value="partner">Seeking Partner</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Title</Label>
                    <Input
                      value={form.title}
                      onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                      placeholder="e.g. Multifamily in Austin"
                    />
                  </div>
                  <div>
                    <Label>Description (optional)</Label>
                    <Textarea
                      value={form.description}
                      onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                      placeholder="Details..."
                    />
                  </div>
                  <div>
                    <Label>Location (optional)</Label>
                    <Input
                      value={form.location}
                      onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                      placeholder="City, State"
                    />
                  </div>
                  <div>
                    <Label>Budget range (optional)</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={form.budget_min}
                        onChange={(e) => setForm((p) => ({ ...p, budget_min: e.target.value }))}
                        placeholder="Min $"
                      />
                      <Input
                        type="number"
                        value={form.budget_max}
                        onChange={(e) => setForm((p) => ({ ...p, budget_max: e.target.value }))}
                        placeholder="Max $"
                      />
                    </div>
                  </div>
                  <Button onClick={handleAdd} disabled={addInterest.isPending}>
                    Add
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
        {!interests || interests.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            {isOwner ? "Add what you're looking to buy, sell, or partner on." : "No deal interests listed."}
          </p>
        ) : (
          <div className="space-y-4">
            {interests.map((i) => (
              <div
                key={i.id}
                className="rounded-lg border p-4 space-y-2"
              >
                <Badge variant="secondary">{INTEREST_LABELS[i.interest_type] ?? i.interest_type}</Badge>
                <h3 className="font-semibold">{i.title}</h3>
                {i.description && (
                  <p className="text-sm text-muted-foreground">{i.description}</p>
                )}
                <div className="flex flex-wrap gap-3 text-sm">
                  {i.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {i.location}
                    </span>
                  )}
                  {(i.budget_min_cents != null || i.budget_max_cents != null) && (
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      {i.budget_min_cents != null && formatCurrency(i.budget_min_cents)}
                      {i.budget_min_cents != null && i.budget_max_cents != null && " - "}
                      {i.budget_max_cents != null && formatCurrency(i.budget_max_cents)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
