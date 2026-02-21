"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UserPlus, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { createReferralWithClient } from "@/hooks/use-referrals";
import { useReferrableClients } from "@/hooks/use-referrals";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const referSchema = z.object({
  clientProfileId: z.string().min(1, "Select a client"),
  notes: z
    .string()
    .trim()
    .min(10, "Context must be at least 10 characters")
    .max(1000),
});

interface ClientProfile {
  id: string;
  full_name: string;
  email: string | null;
  avatar_url: string | null;
}

interface ReferClientDialogProps {
  profileId: string;
  professionalName: string;
  referrerId: string;
  trigger?: React.ReactNode;
}

export function ReferClientDialog({
  profileId,
  professionalName,
  referrerId,
  trigger,
}: ReferClientDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientProfile | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const { clients, isLoading } = useReferrableClients(referrerId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = referSchema.safeParse({
      clientProfileId: selectedClient?.id ?? "",
      notes,
    });
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    setLoading(true);

    try {
      await createReferralWithClient({
        referrerId,
        recipientProfileId: profileId,
        clientProfileId: selectedClient!.id,
        notes,
      });

      toast.success(
        "Referral sent! The recipient will review and accept. You'll earn commission when they create an engagement."
      );
      setSelectedClient(null);
      setNotes("");
      setOpen(false);
    } catch (error: any) {
      toast.error("Failed to refer client");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setSelectedClient(null);
      setNotes("");
    }
    setOpen(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" className="w-full">
            <UserPlus className="mr-2 h-4 w-4" />
            Refer a Client
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Refer a Client to {professionalName.split(" ")[0]}</DialogTitle>
          <DialogDescription>
            You can only refer clients who have initiated a chat with you. Select a client and add context.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Client</Label>
            {isLoading ? (
              <p className="text-sm text-muted-foreground py-4">Loading your clients...</p>
            ) : clients.length === 0 ? (
              <div className="p-4 border rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">
                  No referrable clients yet. Only customers who have messaged you can be referred.
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Ask clients to contact you via the platform first.
                </p>
              </div>
            ) : selectedClient ? (
              <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedClient.avatar_url ?? undefined} />
                  <AvatarFallback>
                    {selectedClient.full_name?.charAt(0) ?? "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{selectedClient.full_name}</p>
                  {selectedClient.email && (
                    <p className="text-sm text-muted-foreground truncate">
                      {selectedClient.email}
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedClient(null)}
                >
                  Change
                </Button>
              </div>
            ) : (
              <div className="border rounded-lg max-h-48 overflow-auto">
                {clients.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className="flex items-center gap-3 w-full p-3 hover:bg-muted text-left"
                    onClick={() => setSelectedClient(c)}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={c.avatar_url ?? undefined} />
                      <AvatarFallback className="text-xs">
                        {c.full_name?.charAt(0) ?? "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{c.full_name}</p>
                      {c.email && (
                        <p className="text-xs text-muted-foreground truncate">
                          {c.email}
                        </p>
                      )}
                    </div>
                    <MessageCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            <Label htmlFor="notes">Context / Message *</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Brief description of what the client needs..."
              rows={4}
              required
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {notes.length}/1000 characters
            </p>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !selectedClient}>
              {loading ? "Sending..." : "Refer Client"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
