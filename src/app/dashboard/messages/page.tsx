"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Mail } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function Messages() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth");
      return;
    }
    setUser(user);
    await fetchProfile(user.id);
    fetchMessages(user.id);
  };

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*, user_roles(role)")
      .eq("id", userId)
      .maybeSingle();
    setProfile(data);
  };

  const fetchMessages = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select(`
          *,
          sender:sender_id(full_name),
          recipient:recipient_id(full_name)
        `)
        .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error: any) {
      toast.error("Failed to load messages");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const userType = profile?.user_roles?.length > 0 ? "agent" : "buyer";

  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col w-full">
        <Header />
        <div className="flex flex-1 w-full">
          <DashboardSidebar userType={userType} />
          <main className="flex-1 p-8 bg-background">
            <div className="flex items-center gap-4 mb-8">
              <SidebarTrigger />
              <div>
                <h1 className="text-3xl font-bold">Messages</h1>
                <p className="text-muted-foreground">Your conversations</p>
              </div>
            </div>

            {loading ? (
              <p className="text-center text-muted-foreground">Loading messages...</p>
            ) : messages.length === 0 ? (
              <Card className="p-12 text-center">
                <Mail className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No messages yet</p>
                <Button onClick={() => router.push("/browse")}>Find Professionals</Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <Card key={message.id} className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold">
                          {message.sender_id === user?.id ? `To: ${message.recipient.full_name}` : `From: ${message.sender.full_name}`}
                        </p>
                        {message.subject && <p className="text-sm text-muted-foreground mt-1">{message.subject}</p>}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(message.created_at), "MMM d, h:mm a")}
                      </p>
                    </div>
                    <p className="text-sm mt-3">{message.content}</p>
                  </Card>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}



