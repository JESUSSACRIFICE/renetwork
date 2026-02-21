"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Mail, Phone, Clock } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function DashboardLeads() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    const fetchLeads = async () => {
      try {
        const { data, error } = await supabase
          .from("leads")
          .select("*")
          .eq("profile_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setLeads(data || []);
      } catch (error: any) {
        toast.error("Failed to load leads");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeads();
  }, [user?.id]);

  const updateLeadStatus = async (leadId: string, status: string) => {
    try {
      const { error } = await supabase
        .from("leads")
        .update({ status })
        .eq("id", leadId);

      if (error) throw error;

      setLeads(
        leads.map((lead) => (lead.id === leadId ? { ...lead, status } : lead)),
      );

      toast.success("Lead status updated");
    } catch (error: any) {
      toast.error("Failed to update lead");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-500";
      case "contacted":
        return "bg-yellow-500";
      case "converted":
        return "bg-green-500";
      case "closed":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Leads</h1>
        <p className="text-muted-foreground">
          Manage your incoming inquiries
        </p>
      </div>

      {loading ? (
        <p className="text-center text-muted-foreground">
          Loading leads...
        </p>
      ) : leads.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground mb-4">No leads yet</p>
          <p className="text-sm text-muted-foreground">
            Leads will appear here when people contact you
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {leads.map((lead) => (
            <Card key={lead.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{lead.name}</h3>
                    <Badge className={getStatusColor(lead.status)}>
                      {lead.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {format(
                        new Date(lead.created_at),
                        "MMM d, yyyy 'at' h:mm a",
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-primary" />
                  <a
                    href={`mailto:${lead.email}`}
                    className="hover:underline"
                  >
                    {lead.email}
                  </a>
                </div>
                {lead.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-primary" />
                    <a
                      href={`tel:${lead.phone}`}
                      className="hover:underline"
                    >
                      {lead.phone}
                    </a>
                  </div>
                )}
              </div>

              <div className="p-4 bg-muted rounded-lg mb-4">
                <p className="text-sm">{lead.message}</p>
              </div>

              <div className="flex gap-2">
                {lead.status === "new" && (
                  <Button
                    size="sm"
                    onClick={() => updateLeadStatus(lead.id, "contacted")}
                  >
                    Mark as Contacted
                  </Button>
                )}
                {lead.status === "contacted" && (
                  <Button
                    size="sm"
                    onClick={() => updateLeadStatus(lead.id, "converted")}
                  >
                    Mark as Converted
                  </Button>
                )}
                {(lead.status === "new" ||
                  lead.status === "contacted") && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateLeadStatus(lead.id, "closed")}
                  >
                    Close Lead
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
