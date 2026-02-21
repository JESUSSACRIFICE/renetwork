"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { useMessages } from "@/hooks/use-messages";
import type { MessageWithParticipants } from "@/hooks/use-messages";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Send, FilePlus } from "lucide-react";
import { format } from "date-fns";

type Thread = {
  otherId: string;
  otherName: string;
  otherAvatar: string | null;
  lastMessage: MessageWithParticipants;
  messages: MessageWithParticipants[];
  unreadCount: number;
};

function buildThreads(
  messages: MessageWithParticipants[],
  currentUserId: string,
): Thread[] {
  const byOther = new Map<string, MessageWithParticipants[]>();
  for (const m of messages) {
    const otherId =
      m.sender_id === currentUserId ? m.recipient_id : m.sender_id;
    if (!byOther.has(otherId)) byOther.set(otherId, []);
    byOther.get(otherId)!.push(m);
  }
  const threads: Thread[] = [];
  for (const [otherId, msgs] of byOther) {
    const sorted = [...msgs].sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
    const last = sorted[sorted.length - 1];
    const other =
      last.sender_id === currentUserId ? last.recipient : last.sender;
    const unreadCount = sorted.filter(
      (m) => m.recipient_id === currentUserId && !m.read,
    ).length;
    threads.push({
      otherId,
      otherName: other?.full_name ?? "Unknown",
      otherAvatar: other?.avatar_url ?? null,
      lastMessage: last,
      messages: sorted,
      unreadCount,
    });
  }
  threads.sort(
    (a, b) =>
      new Date(b.lastMessage.created_at).getTime() -
      new Date(a.lastMessage.created_at).getTime(),
  );
  return threads;
}

const Messages = () => {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const {
    messages,
    unreadCount,
    isLoading: messagesLoading,
    sendMessage,
    isSending,
    markAsRead,
  } = useMessages(user?.id ?? null);
  const [profile, setProfile] = useState<any>(null);
  const [selectedOtherId, setSelectedOtherId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const threads = useMemo(
    () => (user && messages.length > 0 ? buildThreads(messages, user.id) : []),
    [messages, user?.id],
  );

  const selectedThread = useMemo(
    () => threads.find((t) => t.otherId === selectedOtherId) ?? null,
    [threads, selectedOtherId],
  );

  // Mark messages as read when viewing a thread
  useEffect(() => {
    if (!user || !selectedThread) return;
    const unreadIds = selectedThread.messages
      .filter((m) => m.recipient_id === user.id && !m.read)
      .map((m) => m.id);
    if (unreadIds.length > 0) markAsRead(unreadIds);
  }, [user?.id, selectedThread?.otherId]);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const [profileRes, rolesRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", user.id),
      ]);
      const profile = profileRes.data;
      const user_roles = rolesRes.data ?? [];
      setProfile(profile ? { ...profile, user_roles } : null);
    };
    fetchProfile();
  }, [user?.id]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
    }
  }, [user, authLoading, router]);

  const userType: "service_provider" | "agent" =
    profile?.user_roles?.length > 0 ? "service_provider" : "agent";

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = inputValue.trim();
    if (!user || !selectedThread || !text) return;
    setInputValue("");
    try {
      await sendMessage({
        recipientId: selectedThread.otherId,
        content: text,
        subject: selectedThread.lastMessage.subject ?? undefined,
      });
    } catch {
      setInputValue(text);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedThread?.messages]);

  if (!user && !authLoading) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col w-full">
        <Header />
        <div className="flex flex-1 w-full">
          <DashboardSidebar userType={userType} profile={profile} />
          <main className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between gap-4 p-4 border-b">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <div>
                  <h1 className="text-2xl font-bold">Messages</h1>
                  <p className="text-sm text-muted-foreground">
                    {unreadCount > 0
                      ? `${unreadCount} unread message${unreadCount !== 1 ? "s" : ""}`
                      : "Your conversations"}
                  </p>
                </div>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Create order"
                  >
                    <FilePlus className="h-5 w-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Order</DialogTitle>
                  </DialogHeader>
                  <div className="py-4">
                    <p className="text-sm text-muted-foreground">
                      Order creation form will go here.
                    </p>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {messagesLoading ? (
              <div className="flex-1 flex items-center justify-center p-8">
                <p className="text-muted-foreground">Loading messages...</p>
              </div>
            ) : messages.length === 0 ? (
              <Card className="m-8 p-12 text-center">
                <Mail className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No messages yet</p>
                <Button onClick={() => router.push("/search/services")}>
                  Find Professionals
                </Button>
              </Card>
            ) : (
              <div className="flex flex-1 min-h-0">
                {/* Inbox: conversation list */}
                <div className="w-80 border-r flex flex-col bg-muted/20">
                  <div className="flex-1 overflow-y-auto">
                    {threads.map((thread) => (
                      <button
                        key={thread.otherId}
                        type="button"
                        onClick={() => setSelectedOtherId(thread.otherId)}
                        className={`w-full flex items-center gap-3 p-4 text-left hover:bg-muted/50 transition-colors ${
                          selectedOtherId === thread.otherId
                            ? "bg-muted border-l-2 border-primary"
                            : thread.unreadCount > 0
                              ? "bg-primary/5 font-medium"
                              : ""
                        }`}
                      >
                        <Avatar className="h-10 w-10 shrink-0">
                          <AvatarImage
                            src={thread.otherAvatar ?? undefined}
                            alt={thread.otherName}
                          />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {thread.otherName?.charAt(0) ?? "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {thread.otherName}
                          </p>
                          <p
                            className={`text-sm truncate ${
                              thread.unreadCount > 0
                                ? "text-foreground font-medium"
                                : "text-muted-foreground"
                            }`}
                          >
                            {thread.lastMessage.content}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {thread.unreadCount > 0 && (
                            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-medium text-primary-foreground">
                              {thread.unreadCount > 99
                                ? "99+"
                                : thread.unreadCount}
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {format(
                              new Date(thread.lastMessage.created_at),
                              "MMM d",
                            )}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chat panel */}
                <div className="flex-1 flex flex-col min-w-0">
                  {selectedThread ? (
                    <>
                      <div className="border-b p-4 flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={selectedThread.otherAvatar ?? undefined}
                            alt={selectedThread.otherName}
                          />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {selectedThread.otherName?.charAt(0) ?? "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h2 className="font-semibold">
                            {selectedThread.otherName}
                          </h2>
                          {selectedThread.lastMessage.subject && (
                            <p className="text-sm text-muted-foreground">
                              {selectedThread.lastMessage.subject}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {selectedThread.messages.map((msg) => {
                          const isMe = msg.sender_id === user?.id;
                          return (
                            <div
                              key={msg.id}
                              className={`flex ${
                                isMe ? "justify-end" : "justify-start"
                              }`}
                            >
                              <div
                                className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                                  isMe
                                    ? "bg-primary text-primary-foreground rounded-br-md"
                                    : "bg-muted rounded-bl-md"
                                }`}
                              >
                                <p className="text-sm whitespace-pre-wrap break-words">
                                  {msg.content}
                                </p>
                                <p
                                  className={`text-xs mt-1 ${
                                    isMe
                                      ? "text-primary-foreground/80"
                                      : "text-muted-foreground"
                                  }`}
                                >
                                  {format(
                                    new Date(msg.created_at),
                                    "MMM d, h:mm a",
                                  )}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </div>

                      <form
                        onSubmit={handleSend}
                        className="p-4 border-t bg-background"
                      >
                        <div className="flex gap-2">
                          <textarea
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type a message..."
                            className="flex-1 min-h-[44px] max-h-32 resize-none rounded-lg border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                            rows={1}
                            disabled={isSending}
                          />
                          <Button
                            type="submit"
                            size="icon"
                            className="shrink-0 h-11 w-11 bg-primary hover:bg-primary/90"
                            disabled={isSending || !inputValue.trim()}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </form>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground">
                      <p>Select a conversation to start chatting</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Messages;
