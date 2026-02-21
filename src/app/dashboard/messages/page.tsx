"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { useMessages } from "@/hooks/use-messages";
import type { MessageWithParticipants } from "@/hooks/use-messages";
import { useReferrableClients } from "@/hooks/use-referrals";
import { useChatOffers, useAllOfferThreads, type ChatOffer } from "@/hooks/use-chat-offers";
import { ReferFromMessagesDialog } from "@/components/professional/ReferFromMessagesDialog";
import { SendOfferDialog } from "@/components/professional/SendOfferDialog";
import { AcceptOfferPaymentDialog } from "@/components/professional/AcceptOfferPaymentDialog";
import { supabase } from "@/integrations/supabase/client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Mail, Send, UserPlus, FileText, Check, X, Clock, CheckCircle2 } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

type UserType = "service_provider" | "agent";

type Thread = {
  otherId: string;
  otherName: string;
  otherAvatar: string | null;
  lastMessage: MessageWithParticipants | null;
  lastOffer?: ChatOffer | null;
  messages: MessageWithParticipants[];
  unreadCount: number;
  isOfferOnly?: boolean;
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
      isOfferOnly: false,
    });
  }
  threads.sort((a, b) => {
    const aTime = a.lastMessage
      ? new Date(a.lastMessage.created_at).getTime()
      : a.lastOffer
        ? new Date(a.lastOffer.created_at ?? 0).getTime()
        : 0;
    const bTime = b.lastMessage
      ? new Date(b.lastMessage.created_at).getTime()
      : b.lastOffer
        ? new Date(b.lastOffer.created_at ?? 0).getTime()
        : 0;
    return bTime - aTime;
  });
  return threads;
}

export default function Messages() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const recipientParam = searchParams.get("recipient");
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
  const [userType, setUserType] = useState<UserType>("agent");
  const [selectedOtherId, setSelectedOtherId] = useState<string | null>(null);
  const [recipientProfile, setRecipientProfile] = useState<{
    full_name: string | null;
    avatar_url: string | null;
    user_type?: string | null;
  } | null>(null);
  const [otherUserType, setOtherUserType] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [referDialogOpen, setReferDialogOpen] = useState(false);
  const [offerDialogOpen, setOfferDialogOpen] = useState(false);
  const [paymentOffer, setPaymentOffer] = useState<{
    id: string;
    title: string;
    amount_cents: number;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { clients: referrableClients } = useReferrableClients(user?.id ?? undefined);
  const { offerThreads } = useAllOfferThreads(user?.id ?? null);
  const [offerThreadProfiles, setOfferThreadProfiles] = useState<
    Record<string, { full_name: string | null; avatar_url: string | null }>
  >({});

  // Sync recipient from URL
  useEffect(() => {
    if (recipientParam && recipientParam !== user?.id) {
      setSelectedOtherId(recipientParam);
    }
  }, [recipientParam, user?.id]);

  // Fetch recipient profile when starting new conversation
  useEffect(() => {
    if (!selectedOtherId || !user) return;
    const threadExists = messages.some(
      (m) => m.sender_id === selectedOtherId || m.recipient_id === selectedOtherId,
    );
    if (threadExists) {
      setRecipientProfile(null);
      return;
    }
    supabase
      .from("profiles")
      .select("full_name, avatar_url, user_type")
      .eq("id", selectedOtherId)
      .maybeSingle()
      .then(({ data }) =>
        setRecipientProfile(
          data
            ? {
                full_name: data.full_name,
                avatar_url: data.avatar_url,
                user_type: (data as { user_type?: string }).user_type,
              }
            : null
        ),
      );
  }, [selectedOtherId, user?.id, messages]);

  // Fetch profiles for offer-only thread participants
  const offerThreadOtherIds = useMemo(
    () => [...new Set(offerThreads.map((t) => t.otherId))],
    [offerThreads],
  );
  useEffect(() => {
    if (offerThreadOtherIds.length === 0) return;
    supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .in("id", offerThreadOtherIds)
      .then(({ data }) => {
        const map: Record<string, { full_name: string | null; avatar_url: string | null }> = {};
        for (const p of data ?? []) {
          map[p.id] = { full_name: p.full_name, avatar_url: p.avatar_url };
        }
        setOfferThreadProfiles((prev) => ({ ...prev, ...map }));
      });
  }, [offerThreadOtherIds]);

  // Fetch other user's type for thread (for offer button visibility)
  useEffect(() => {
    if (!selectedOtherId) {
      setOtherUserType(null);
      return;
    }
    supabase
      .from("profiles")
      .select("user_type")
      .eq("id", selectedOtherId)
      .maybeSingle()
      .then(({ data }) =>
        setOtherUserType((data as { user_type?: string } | null)?.user_type ?? null),
      );
  }, [selectedOtherId]);

  const threads = useMemo(() => {
    const messageThreads =
      user && messages.length > 0 ? buildThreads(messages, user.id) : [];
    const messageOtherIds = new Set(messageThreads.map((t) => t.otherId));
    const offerByOther = new Map(offerThreads.map((ot) => [ot.otherId, ot]));

    // For message threads: if last activity is an offer, show it in preview
    for (const thread of messageThreads) {
      const ot = offerByOther.get(thread.otherId);
      if (ot) {
        const msgTime = new Date(thread.lastMessage!.created_at).getTime();
        const offerTime = new Date(ot.lastOffer.created_at ?? 0).getTime();
        if (offerTime >= msgTime) {
          (thread as Thread).lastOffer = ot.lastOffer;
        }
      }
    }

    // Add offer-only threads (conversations with offers but no messages)
    const offerOnlyThreads: Thread[] = offerThreads
      .filter((ot) => !messageOtherIds.has(ot.otherId))
      .map((ot) => {
        const profile = offerThreadProfiles[ot.otherId];
        return {
          otherId: ot.otherId,
          otherName: profile?.full_name ?? "Unknown",
          otherAvatar: profile?.avatar_url ?? null,
          lastMessage: null,
          lastOffer: ot.lastOffer,
          messages: [],
          unreadCount: ot.isRecipient && ot.lastOffer.status === "pending" ? 1 : 0,
          isOfferOnly: true,
        };
      });

    const combined = [...messageThreads, ...offerOnlyThreads];
    const getThreadTime = (t: Thread) => {
      const msgTime = t.lastMessage
        ? new Date(t.lastMessage.created_at).getTime()
        : 0;
      const offerTime = t.lastOffer
        ? new Date(t.lastOffer.created_at ?? 0).getTime()
        : 0;
      return Math.max(msgTime, offerTime);
    };
    combined.sort((a, b) => getThreadTime(b) - getThreadTime(a));
    return combined;
  }, [messages, user?.id, offerThreads, offerThreadProfiles]);

  const selectedThread = useMemo(
    () => threads.find((t) => t.otherId === selectedOtherId) ?? null,
    [threads, selectedOtherId],
  );

  const recipientId = selectedThread?.otherId ?? selectedOtherId;
  const recipientName =
    selectedThread?.otherName ?? recipientProfile?.full_name ?? "Professional";
  const { offers, sendOffer, isSending: isSendingOffer, respondToOffer, isResponding, withdrawOffer, isWithdrawing, markComplete, isMarkingComplete, respondToCompletion, isRespondingToCompletion } = useChatOffers(
    user?.id ?? null,
    recipientId
  );

  // Service provider can send offers when chatting with a customer
  const canSendOffer =
    userType === "service_provider" &&
    otherUserType === "customer" &&
    !!recipientId;

  // Cannot send another offer while there's an active offer between customer and provider
  // (pending, accepted, or completion_requested in either direction)
  const ACTIVE_OFFER_STATUSES = ["pending", "accepted", "completion_requested"] as const;
  const hasActiveOffer = offers.some((o) =>
    ACTIVE_OFFER_STATUSES.includes(o.status as (typeof ACTIVE_OFFER_STATUSES)[number])
  );
  const canSendNewOffer = canSendOffer && !hasActiveOffer;

  const isReferrableClient = selectedThread
    ? referrableClients.some((c) => c.id === selectedThread.otherId)
    : false;

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

      const urlParams = new URLSearchParams(window.location.search);
      const overrideTypeParam = urlParams.get("type");

      if (overrideTypeParam === "buyer" || overrideTypeParam === "agent") {
        setUserType(overrideTypeParam as UserType);
        return;
      }

      const hasRoles = user_roles && user_roles.length > 0;
      setUserType(hasRoles ? "service_provider" : "agent");
    };
    fetchProfile();
  }, [user?.id]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
    }
  }, [user, authLoading, router]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = inputValue.trim();
    const recipientId = selectedThread?.otherId ?? selectedOtherId;
    if (!user || !recipientId || !text) return;
    setInputValue("");
    try {
      await sendMessage({
        recipientId,
        content: text,
        subject: selectedThread?.lastMessage?.subject ?? "Inquiry",
      });
      if (recipientParam && recipientParam === recipientId) {
        router.replace("/dashboard/messages");
      }
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

  // Merge messages and offers into a single timeline (by created_at)
  const timelineItems = useMemo(() => {
    if (!user || !recipientId) return [];
    const msgs = selectedThread?.messages ?? [];
    const msgItems = msgs.map((m) => ({
      type: "message" as const,
      id: m.id,
      createdAt: new Date(m.created_at).getTime(),
      data: m,
    }));
    const offItems = offers.map((o) => ({
      type: "offer" as const,
      id: o.id,
      createdAt: new Date(o.created_at ?? 0).getTime(),
      data: o,
    }));
    return [...msgItems, ...offItems].sort((a, b) => a.createdAt - b.createdAt);
  }, [selectedThread?.messages, offers, user?.id, recipientId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [timelineItems]);

  if (!user && !authLoading) {
    return null;
  }

  return (
    <>
      <div className="flex items-center gap-4 p-4 border-b bg-white shrink-0">
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

            {messagesLoading ? (
              <div className="flex-1 flex items-center justify-center p-8">
                <p className="text-muted-foreground">Loading messages...</p>
              </div>
            ) : messages.length === 0 && offerThreads.length === 0 && !recipientParam ? (
              <Card className="m-8 p-12 text-center">
                <Mail className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No messages yet</p>
                <Button onClick={() => router.push("/search/services")}>
                  Find Professionals
                </Button>
              </Card>
            ) : (
              <div className="flex flex-1 min-h-0">
                <div className="w-80 border-r flex flex-col bg-white">
                  <div className="flex-1 overflow-y-auto">
                    {threads.map((thread) => (
                      <button
                        key={thread.otherId}
                        type="button"
                        onClick={() => setSelectedOtherId(thread.otherId)}
                        className={`w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 transition-colors ${
                          selectedOtherId === thread.otherId
                            ? "bg-gray-100 border-l-2 border-primary"
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
                            {thread.lastOffer
                              ? `Offer: ${thread.lastOffer.title}`
                              : thread.lastMessage?.content ?? ""}
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
                              new Date(
                                thread.lastOffer?.created_at ??
                                  thread.lastMessage?.created_at ??
                                  Date.now(),
                              ),
                              "MMM d",
                            )}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex-1 flex flex-col min-w-0 bg-gray-50">
                  {selectedThread ? (
                    <>
                      <div className="border-b p-4 flex items-center justify-between gap-3 bg-white">
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar className="h-10 w-10 shrink-0">
                            <AvatarImage
                              src={selectedThread.otherAvatar ?? undefined}
                              alt={selectedThread.otherName}
                            />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {selectedThread.otherName?.charAt(0) ?? "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <h2 className="font-semibold truncate">
                              {selectedThread.otherName}
                            </h2>
                            {(selectedThread.lastMessage?.subject ||
                              selectedThread.lastOffer) && (
                              <p className="text-sm text-muted-foreground truncate">
                                {selectedThread.lastOffer
                                  ? `Offer: ${selectedThread.lastOffer.title}`
                                  : selectedThread.lastMessage?.subject}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {canSendOffer && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        canSendNewOffer &&
                                        setOfferDialogOpen(true)
                                      }
                                      disabled={!canSendNewOffer}
                                    >
                                      <FileText className="h-4 w-4 mr-2" />
                                      Send Offer
                                    </Button>
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {hasActiveOffer
                                    ? "There's already an active offer. Wait for it to be completed, declined, or withdrawn."
                                    : "Send an offer to this customer"}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          {isReferrableClient && user && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setReferDialogOpen(true)}
                            >
                              <UserPlus className="h-4 w-4 mr-2" />
                              Refer
                            </Button>
                          )}
                        </div>
                      </div>
                      {canSendOffer && canSendNewOffer && (
                        <SendOfferDialog
                          open={offerDialogOpen}
                          onOpenChange={setOfferDialogOpen}
                          recipientId={recipientId!}
                          recipientName={recipientName}
                          onSend={({ title, description, amountCents, deliveryDays }) =>
                            sendOffer({
                              recipientId: recipientId!,
                              title,
                              description,
                              amountCents,
                              deliveryDays,
                            })
                          }
                          isSending={isSendingOffer}
                        />
                      )}
                      {paymentOffer && (
                        <AcceptOfferPaymentDialog
                          open={!!paymentOffer}
                          onOpenChange={(open) => !open && setPaymentOffer(null)}
                          offer={paymentOffer}
                          onSuccess={() => {
                            respondToOffer({
                              offerId: paymentOffer.id,
                              status: "accepted",
                            });
                            setPaymentOffer(null);
                          }}
                          getAccessToken={async () => {
                            const { data: { session } } = await supabase.auth.getSession();
                            return session?.access_token ?? null;
                          }}
                        />
                      )}
                      {isReferrableClient && user && (
                        <ReferFromMessagesDialog
                          open={referDialogOpen}
                          onOpenChange={setReferDialogOpen}
                          clientId={selectedThread.otherId}
                          clientName={selectedThread.otherName}
                          clientAvatar={selectedThread.otherAvatar}
                          referrerId={user.id}
                        />
                      )}

                      <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {timelineItems.map((item) => {
                          if (item.type === "message") {
                            const msg = item.data as MessageWithParticipants;
                            const isMe = msg.sender_id === user?.id;
                            return (
                              <div
                                key={`msg-${msg.id}`}
                                className={`flex ${
                                  isMe ? "justify-end" : "justify-start"
                                }`}
                              >
                                <div
                                  className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                                    isMe
                                      ? "bg-primary text-primary-foreground rounded-br-md"
                                      : "bg-white border rounded-bl-md"
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
                          }
                          const offer = item.data as ChatOffer;
                          const isFromMe = offer.sender_id === user?.id;
                          const isRecipient = offer.recipient_id === user?.id;
                          const isPending = offer.status === "pending";
                          return (
                            <div
                              key={`offer-${offer.id}`}
                              className={`flex ${
                                isFromMe ? "justify-end" : "justify-start"
                              }`}
                            >
                              <div
                                className={`max-w-[85%] rounded-xl border px-4 py-3 ${
                                  isFromMe
                                    ? "bg-primary/10 border-primary/30 text-foreground"
                                    : "bg-white border"
                                }`}
                              >
                                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-1">
                                  <FileText className="h-3.5 w-3.5" />
                                  Offer
                                </div>
                                <p className="font-medium text-sm">{offer.title}</p>
                                {offer.description && (
                                  <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                                    {offer.description}
                                  </p>
                                )}
                                <p className="text-sm font-semibold mt-2">
                                  ${(offer.amount_cents / 100).toFixed(2)}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {format(
                                    new Date(offer.created_at ?? 0),
                                    "MMM d, h:mm a",
                                  )}
                                </p>
                                {isPending && isRecipient && (
                                  <div className="flex gap-2 mt-3">
                                    <Button
                                      size="sm"
                                      className="h-8"
                                      onClick={() =>
                                        setPaymentOffer({
                                          id: offer.id,
                                          title: offer.title,
                                          amount_cents: offer.amount_cents,
                                        })
                                      }
                                      disabled={isResponding}
                                    >
                                      <Check className="h-4 w-4 mr-1" />
                                      Pay & Accept
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-8"
                                      onClick={() =>
                                        respondToOffer({
                                          offerId: offer.id,
                                          status: "declined",
                                        })
                                      }
                                      disabled={isResponding}
                                    >
                                      <X className="h-4 w-4 mr-1" />
                                      Decline
                                    </Button>
                                  </div>
                                )}
                                {isPending && isFromMe && (
                                  <div className="flex gap-2 mt-3">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-8 text-amber-600 border-amber-200 hover:bg-amber-50"
                                      onClick={() => withdrawOffer(offer.id)}
                                      disabled={isWithdrawing}
                                    >
                                      <X className="h-4 w-4 mr-1" />
                                      Withdraw
                                    </Button>
                                  </div>
                                )}
                                {!isPending && (
                                  <>
                                    <p
                                      className={`text-xs font-medium mt-2 ${
                                        offer.status === "accepted"
                                          ? "text-green-600"
                                          : offer.status === "completion_requested"
                                            ? "text-blue-600"
                                            : offer.status === "completed"
                                              ? "text-emerald-600"
                                              : offer.status === "withdrawn"
                                                ? "text-amber-600"
                                                : "text-muted-foreground"
                                      }`}
                                    >
                                      {offer.status === "accepted"
                                        ? "Accepted"
                                        : offer.status === "completion_requested"
                                          ? "Completion requested"
                                          : offer.status === "completed"
                                            ? "Completed"
                                            : offer.status === "withdrawn"
                                              ? "Withdrawn"
                                              : "Declined"}
                                    </p>
                                    {(offer.status === "accepted" ||
                                      offer.status === "completion_requested" ||
                                      offer.status === "completed") && (
                                      <div className="mt-2 pt-2 border-t border-border/50">
                                        <p className="text-xs font-medium text-muted-foreground mb-1">
                                          Timeline
                                        </p>
                                        <div className="flex flex-wrap gap-3 text-xs items-center">
                                          {offer.accepted_at && (
                                            <span className="flex items-center gap-1">
                                              <Check className="h-3 w-3 text-green-600" />
                                              Accepted{" "}
                                              {format(
                                                new Date(offer.accepted_at),
                                                "MMM d, h:mm a",
                                              )}
                                            </span>
                                          )}
                                          {offer.delivery_days && (
                                            <span className="flex items-center gap-1 text-primary">
                                              <Clock className="h-3 w-3" />
                                              Est. {offer.delivery_days} day
                                              {offer.delivery_days !== 1 ? "s" : ""} delivery
                                            </span>
                                          )}
                                          {offer.completion_requested_at && (
                                            <span className="flex items-center gap-1 text-blue-600">
                                              <Clock className="h-3 w-3" />
                                              Completion requested{" "}
                                              {format(
                                                new Date(offer.completion_requested_at),
                                                "MMM d, h:mm a",
                                              )}
                                            </span>
                                          )}
                                          {offer.status === "completed" && (
                                            <span className="flex items-center gap-1 text-emerald-600">
                                              <CheckCircle2 className="h-3 w-3" />
                                              Completed
                                            </span>
                                          )}
                                        </div>
                                        {offer.status === "accepted" && isFromMe && (
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-6 text-xs mt-2"
                                            onClick={() => markComplete(offer.id)}
                                            disabled={isMarkingComplete}
                                          >
                                            <Check className="h-3 w-3 mr-1" />
                                            Mark as complete
                                          </Button>
                                        )}
                                        {offer.status === "completion_requested" &&
                                          isRecipient && (
                                            <div className="flex gap-2 mt-2">
                                              <Button
                                                size="sm"
                                                className="h-7 text-xs"
                                                onClick={() =>
                                                  respondToCompletion({
                                                    offerId: offer.id,
                                                    accept: true,
                                                  })
                                                }
                                                disabled={isRespondingToCompletion}
                                              >
                                                <Check className="h-3 w-3 mr-1" />
                                                Accept
                                              </Button>
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-7 text-xs"
                                                onClick={() =>
                                                  respondToCompletion({
                                                    offerId: offer.id,
                                                    accept: false,
                                                  })
                                                }
                                                disabled={isRespondingToCompletion}
                                              >
                                                <X className="h-3 w-3 mr-1" />
                                                Reject
                                              </Button>
                                            </div>
                                          )}
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </div>

                      <form
                        onSubmit={handleSend}
                        className="p-4 border-t bg-white"
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
                  ) : selectedOtherId ? (
                    <>
                      <div className="border-b p-4 flex items-center justify-between gap-3 bg-white">
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar className="h-10 w-10 shrink-0">
                            <AvatarImage
                              src={recipientProfile?.avatar_url ?? undefined}
                              alt={recipientProfile?.full_name ?? "User"}
                            />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {(recipientProfile?.full_name ?? "Professional").charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h2 className="font-semibold">
                              {recipientProfile?.full_name ?? "Professional"}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                              New conversation
                            </p>
                          </div>
                        </div>
                        {canSendOffer && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="shrink-0"
                                    onClick={() =>
                                      canSendNewOffer &&
                                      setOfferDialogOpen(true)
                                    }
                                    disabled={!canSendNewOffer}
                                  >
                                    <FileText className="h-4 w-4 mr-2" />
                                    Send Offer
                                  </Button>
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                {hasActiveOffer
                                  ? "There's already an active offer. Wait for it to be completed, declined, or withdrawn."
                                  : "Send an offer to this customer"}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                      {canSendOffer && canSendNewOffer && (
                        <SendOfferDialog
                          open={offerDialogOpen}
                          onOpenChange={setOfferDialogOpen}
                          recipientId={recipientId!}
                          recipientName={recipientName}
                          onSend={({ title, description, amountCents, deliveryDays }) =>
                            sendOffer({
                              recipientId: recipientId!,
                              title,
                              description,
                              amountCents,
                              deliveryDays,
                            })
                          }
                          isSending={isSendingOffer}
                        />
                      )}
                      {paymentOffer && (
                        <AcceptOfferPaymentDialog
                          open={!!paymentOffer}
                          onOpenChange={(open) => !open && setPaymentOffer(null)}
                          offer={paymentOffer}
                          onSuccess={() => {
                            respondToOffer({
                              offerId: paymentOffer.id,
                              status: "accepted",
                            });
                            setPaymentOffer(null);
                          }}
                          getAccessToken={async () => {
                            const { data: { session } } = await supabase.auth.getSession();
                            return session?.access_token ?? null;
                          }}
                        />
                      )}
                      <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {timelineItems.length > 0 ? (
                          timelineItems.map((item) => {
                            if (item.type === "message") {
                              const msg = item.data as MessageWithParticipants;
                              const isMe = msg.sender_id === user?.id;
                              return (
                                <div
                                  key={`msg-${msg.id}`}
                                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                                >
                                  <div
                                    className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                                      isMe
                                        ? "bg-primary text-primary-foreground rounded-br-md"
                                        : "bg-white border rounded-bl-md"
                                    }`}
                                  >
                                    <p className="text-sm whitespace-pre-wrap break-words">
                                      {msg.content}
                                    </p>
                                    <p
                                      className={`text-xs mt-1 ${
                                        isMe ? "text-primary-foreground/80" : "text-muted-foreground"
                                      }`}
                                    >
                                      {format(new Date(msg.created_at), "MMM d, h:mm a")}
                                    </p>
                                  </div>
                                </div>
                              );
                            }
                            const offer = item.data as ChatOffer;
                            const isFromMe = offer.sender_id === user?.id;
                            const isRecipient = offer.recipient_id === user?.id;
                            const isPending = offer.status === "pending";
                            return (
                              <div
                                key={`offer-${offer.id}`}
                                className={`flex ${isFromMe ? "justify-end" : "justify-start"}`}
                              >
                                <div
                                  className={`max-w-[85%] rounded-xl border px-4 py-3 ${
                                    isFromMe
                                      ? "bg-primary/10 border-primary/30 text-foreground"
                                      : "bg-white border"
                                  }`}
                                >
                                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-1">
                                    <FileText className="h-3.5 w-3.5" />
                                    Offer
                                  </div>
                                  <p className="font-medium text-sm">{offer.title}</p>
                                  {offer.description && (
                                    <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                                      {offer.description}
                                    </p>
                                  )}
                                  <p className="text-sm font-semibold mt-2">
                                    ${(offer.amount_cents / 100).toFixed(2)}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {format(new Date(offer.created_at ?? 0), "MMM d, h:mm a")}
                                  </p>
                                  {isPending && isRecipient && (
                                    <div className="flex gap-2 mt-3">
                                      <Button
                                        size="sm"
                                        className="h-8"
                                        onClick={() =>
                                          setPaymentOffer({
                                            id: offer.id,
                                            title: offer.title,
                                            amount_cents: offer.amount_cents,
                                          })
                                        }
                                        disabled={isResponding}
                                      >
                                        <Check className="h-4 w-4 mr-1" />
                                        Pay & Accept
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-8"
                                        onClick={() =>
                                          respondToOffer({ offerId: offer.id, status: "declined" })
                                        }
                                        disabled={isResponding}
                                      >
                                        <X className="h-4 w-4 mr-1" />
                                        Decline
                                      </Button>
                                    </div>
                                  )}
                                  {isPending && isFromMe && (
                                    <div className="flex gap-2 mt-3">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-8 text-amber-600 border-amber-200 hover:bg-amber-50"
                                        onClick={() => withdrawOffer(offer.id)}
                                        disabled={isWithdrawing}
                                      >
                                        <X className="h-4 w-4 mr-1" />
                                        Withdraw
                                      </Button>
                                    </div>
                                  )}
                                  {!isPending && (
                                    <>
                                      <p
                                        className={`text-xs font-medium mt-2 ${
                                          offer.status === "accepted"
                                            ? "text-green-600"
                                            : offer.status === "completion_requested"
                                              ? "text-blue-600"
                                              : offer.status === "completed"
                                                ? "text-emerald-600"
                                                : offer.status === "withdrawn"
                                                  ? "text-amber-600"
                                                  : "text-muted-foreground"
                                        }`}
                                      >
                                        {offer.status === "accepted"
                                          ? "Accepted"
                                          : offer.status === "completion_requested"
                                            ? "Completion requested"
                                            : offer.status === "completed"
                                              ? "Completed"
                                              : offer.status === "withdrawn"
                                                ? "Withdrawn"
                                                : "Declined"}
                                      </p>
                                      {(offer.status === "accepted" ||
                                        offer.status === "completion_requested" ||
                                        offer.status === "completed") && (
                                        <div className="mt-2 pt-2 border-t border-border/50">
                                          <p className="text-xs font-medium text-muted-foreground mb-1">
                                            Timeline
                                          </p>
                                          <div className="flex flex-wrap gap-3 text-xs items-center">
                                            {offer.accepted_at && (
                                              <span className="flex items-center gap-1">
                                                <Check className="h-3 w-3 text-green-600" />
                                                Accepted{" "}
                                                {format(
                                                  new Date(offer.accepted_at),
                                                  "MMM d, h:mm a",
                                                )}
                                              </span>
                                            )}
                                            {offer.delivery_days && (
                                              <span className="flex items-center gap-1 text-primary">
                                                <Clock className="h-3 w-3" />
                                                Est. {offer.delivery_days} day
                                                {offer.delivery_days !== 1 ? "s" : ""} delivery
                                              </span>
                                            )}
                                            {offer.completion_requested_at && (
                                              <span className="flex items-center gap-1 text-blue-600">
                                                <Clock className="h-3 w-3" />
                                                Completion requested{" "}
                                                {format(
                                                  new Date(offer.completion_requested_at),
                                                  "MMM d, h:mm a",
                                                )}
                                              </span>
                                            )}
                                            {offer.status === "completed" && (
                                              <span className="flex items-center gap-1 text-emerald-600">
                                                <CheckCircle2 className="h-3 w-3" />
                                                Completed
                                              </span>
                                            )}
                                          </div>
                                          {offer.status === "accepted" && isFromMe && (
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              className="h-6 text-xs mt-2"
                                              onClick={() => markComplete(offer.id)}
                                              disabled={isMarkingComplete}
                                            >
                                              <Check className="h-3 w-3 mr-1" />
                                              Mark as complete
                                            </Button>
                                          )}
                                          {offer.status === "completion_requested" &&
                                            isRecipient && (
                                              <div className="flex gap-2 mt-2">
                                                <Button
                                                  size="sm"
                                                  className="h-7 text-xs"
                                                  onClick={() =>
                                                    respondToCompletion({
                                                      offerId: offer.id,
                                                      accept: true,
                                                    })
                                                  }
                                                  disabled={isRespondingToCompletion}
                                                >
                                                  <Check className="h-3 w-3 mr-1" />
                                                  Accept
                                                </Button>
                                                <Button
                                                  size="sm"
                                                  variant="outline"
                                                  className="h-7 text-xs"
                                                  onClick={() =>
                                                    respondToCompletion({
                                                      offerId: offer.id,
                                                      accept: false,
                                                    })
                                                  }
                                                  disabled={isRespondingToCompletion}
                                                >
                                                  <X className="h-3 w-3 mr-1" />
                                                  Reject
                                                </Button>
                                              </div>
                                            )}
                                        </div>
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="flex items-center justify-center h-full text-muted-foreground">
                            <p>Start the conversation by typing a message below</p>
                          </div>
                        )}
                        <div ref={messagesEndRef} />
                      </div>
                      <form
                        onSubmit={handleSend}
                        className="p-4 border-t bg-white"
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
    </>
  );
}
