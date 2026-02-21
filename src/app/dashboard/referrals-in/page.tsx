"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { UserPlus, FileText, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  useReferralsReceived,
  acceptReferral,
  createEngagement,
} from "@/hooks/use-referrals";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";

const REFERRAL_TERMS = `By accepting this referral, you agree to:
• Work in good faith with the referred client
• Commission will be paid to the referrer when you create an engagement/contract with this client
• Standard platform referral terms apply`;

export default function ReferralsInPage() {
  const { user } = useAuth();
  const [createEngagementOpen, setCreateEngagementOpen] = useState(false);
  const [selectedReferral, setSelectedReferral] = useState<any>(null);
  const [engagementTitle, setEngagementTitle] = useState("");
  const [engagementNotes, setEngagementNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { referrals, isLoading, refetch } = useReferralsReceived(user?.id);

  const pendingReferrals = referrals.filter(
    (r: any) => r.status === "pending_acceptance"
  );
  const acceptedReferrals = referrals.filter(
    (r: any) => r.status === "accepted" && r.client_profile_id
  );

  const handleAccept = async (referralId: string) => {
    try {
      await acceptReferral(referralId);
      toast.success("Referral accepted");
      refetch();
    } catch (error: any) {
      toast.error("Failed to accept");
    }
  };

  const handleCreateEngagement = async () => {
    if (!selectedReferral?.client_profile_id || !user?.id) return;
    setSubmitting(true);
    try {
      await createEngagement({
        providerId: user.id,
        clientId: selectedReferral.client_profile_id,
        referralId: selectedReferral.id,
        title: engagementTitle || undefined,
        notes: engagementNotes || undefined,
      });
      toast.success("Engagement created! Commission will be paid to the referrer.");
      setCreateEngagementOpen(false);
      setSelectedReferral(null);
      setEngagementTitle("");
      setEngagementNotes("");
      refetch();
    } catch (error: any) {
      toast.error("Failed to create engagement");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Referrals to You</h1>
          <p className="text-muted-foreground">
            Review and accept referrals. Create engagements to trigger commission.
          </p>
        </div>

        {isLoading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : (
          <div className="space-y-8">
            {pendingReferrals.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Pending Acceptance ({pendingReferrals.length})
                </h2>
                <div className="space-y-4">
                  {pendingReferrals.map((r: any) => (
                    <Card key={r.id} className="p-6">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback>
                                {r.client?.full_name?.charAt(0) ?? r.leads?.name?.charAt(0) ?? "?"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-semibold">
                                {r.client?.full_name ?? r.leads?.name ?? "Client"}
                              </h3>
                              {(r.client?.email ?? r.leads?.email) && (
                                <p className="text-sm text-muted-foreground">
                                  {r.client?.email ?? r.leads?.email}
                                </p>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">
                            Referred by {r.referrer?.full_name ?? "Unknown"}
                          </p>
                          {r.notes && (
                            <div className="mt-3 p-3 bg-muted rounded-lg">
                              <p className="text-sm">{r.notes}</p>
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground mt-3">
                            {format(new Date(r.created_at), "MMM d, yyyy")}
                          </p>
                        </div>
                        <div className="space-y-3 shrink-0">
                          <div className="p-3 bg-muted/50 rounded-lg text-xs max-w-sm">
                            {REFERRAL_TERMS}
                          </div>
                          <Button
                            onClick={() => handleAccept(r.id)}
                            className="w-full md:w-auto"
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Accept Referral
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {acceptedReferrals.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Accepted – Create Engagement ({acceptedReferrals.length})
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Create an engagement with the client to trigger commission for the referrer.
                </p>
                <div className="space-y-4">
                  {acceptedReferrals.map((r: any) => (
                    <Card key={r.id} className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>
                              {r.client?.full_name?.charAt(0) ?? "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">
                              {r.client?.full_name ?? "Client"}
                            </h3>
                            {r.client?.email && (
                              <p className="text-sm text-muted-foreground">
                                {r.client.email}
                              </p>
                            )}
                          </div>
                          <Badge variant="secondary">Accepted</Badge>
                        </div>
                        <Button
                          onClick={() => {
                            setSelectedReferral(r);
                            setCreateEngagementOpen(true);
                          }}
                        >
                          Create Engagement
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {pendingReferrals.length === 0 && acceptedReferrals.length === 0 && (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground mb-4">No referrals yet</p>
                <p className="text-sm text-muted-foreground">
                  Referrals will appear here when others refer clients to you
                </p>
                <Link href="/referral/dashboard" className="mt-4 inline-block">
                  <Button variant="outline">View Referral Dashboard</Button>
                </Link>
              </Card>
            )}
          </div>
        )}
      </div>

      <Dialog open={createEngagementOpen} onOpenChange={setCreateEngagementOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Engagement</DialogTitle>
            <DialogDescription>
              Creating an engagement with {selectedReferral?.client?.full_name} will trigger commission for the referrer.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="title">Title (optional)</Label>
              <Input
                id="title"
                value={engagementTitle}
                onChange={(e) => setEngagementTitle(e.target.value)}
                placeholder="e.g. Home purchase consultation"
              />
            </div>
            <div>
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                value={engagementNotes}
                onChange={(e) => setEngagementNotes(e.target.value)}
                placeholder="Project details..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateEngagementOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateEngagement} disabled={submitting}>
              {submitting ? "Creating..." : "Create Engagement"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
