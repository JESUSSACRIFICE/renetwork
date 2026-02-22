"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { UserPlus, ChevronsUpDown } from "lucide-react";
import { toast } from "sonner";
import { createReferralWithClient } from "@/hooks/use-referrals";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const SEARCH_DEBOUNCE_MS = 300;

interface ReferFromMessagesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  clientName: string;
  clientAvatar?: string | null;
  referrerId: string;
}

export function ReferFromMessagesDialog({
  open,
  onOpenChange,
  clientId,
  clientName,
  clientAvatar,
  referrerId,
}: ReferFromMessagesDialogProps) {
  const [recipients, setRecipients] = useState<
    Array<{ id: string; full_name: string; email?: string | null; avatar_url?: string | null }>
  >([]);
  const [loadingRecipients, setLoadingRecipients] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInputValue, setSearchInputValue] = useState("");
  const [selectedRecipient, setSelectedRecipient] = useState<{
    id: string;
    full_name: string;
    email?: string | null;
    avatar_url?: string | null;
  } | null>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const searchProfiles = useCallback(
    async (query: string) => {
      if (!referrerId || !open) return;
      setLoadingRecipients(true);
      const q = query.trim();
      let queryBuilder = supabase
        .from("profiles")
        .select("id, full_name, email, avatar_url")
        .eq("user_type", "service_provider")
        .neq("id", referrerId)
        .neq("id", clientId)
        .limit(20);

      if (q.length >= 2) {
        const pattern = `%${q}%`;
        queryBuilder = queryBuilder.or(
          `full_name.ilike.${pattern},email.ilike.${pattern}`,
        );
      }

      const { data, error } = await queryBuilder;
      setLoadingRecipients(false);
      if (error) {
        toast.error("Failed to search professionals");
        setRecipients([]);
        return;
      }
      setRecipients(data ?? []);
    },
    [referrerId, clientId, open],
  );

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => searchProfiles(searchQuery), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchQuery, open, searchProfiles]);

  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      setSearchInputValue("");
      setSelectedRecipient(null);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecipient || notes.trim().length < 10) {
      toast.error("Select a professional and add context (min 10 characters)");
      return;
    }

    setSubmitting(true);
    try {
      await createReferralWithClient({
        referrerId,
        recipientProfileId: selectedRecipient.id,
        clientProfileId: clientId,
        notes: notes.trim(),
      });
      toast.success(
        "Referral sent! The recipient will review and accept. You'll earn commission when they create an offer with the client and the client accepts."
      );
      setNotes("");
      setSelectedRecipient(null);
      setSearchQuery("");
      setSearchInputValue("");
      onOpenChange(false);
    } catch (error: any) {
      toast.error("Failed to refer client");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setNotes("");
      setSelectedRecipient(null);
      setSearchQuery("");
      setSearchInputValue("");
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Refer {clientName.split(" ")[0]} to a Professional
          </DialogTitle>
          <DialogDescription>
            Share this client with another professional. You&apos;ll earn commission when they create an offer with the client and the client accepts.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
            <Avatar className="h-10 w-10">
              <AvatarImage src={clientAvatar ?? undefined} />
              <AvatarFallback>{clientName?.charAt(0) ?? "?"}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{clientName}</p>
              <p className="text-sm text-muted-foreground">Client to refer</p>
            </div>
          </div>

          <div>
            <Label>Refer to professional</Label>
            <p className="text-xs text-muted-foreground mt-1 mb-2">
              Search by name or email
            </p>
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={popoverOpen}
                  className="w-full justify-between mt-2"
                >
                  {selectedRecipient ? (
                    <span className="truncate">
                      {selectedRecipient.full_name}
                      {selectedRecipient.email && (
                        <span className="text-muted-foreground font-normal">
                          {" "}({selectedRecipient.email})
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">
                      Search professionals...
                    </span>
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                <Command
                  shouldFilter={false}
                  filter={() => 1}
                >
                  <CommandInput
                    placeholder="Search by name or email..."
                    value={searchInputValue}
                    onValueChange={(v) => {
                      setSearchInputValue(v);
                      setSearchQuery(v);
                    }}
                  />
                  <CommandList>
                    <CommandEmpty>
                      {loadingRecipients
                        ? "Searching..."
                        : searchQuery.length < 2
                          ? "Type at least 2 characters to search"
                          : "No professionals found"}
                    </CommandEmpty>
                    <CommandGroup>
                      {recipients.map((r) => (
                        <CommandItem
                          key={r.id}
                          value={r.id}
                          onSelect={() => {
                            setSelectedRecipient(r);
                            setPopoverOpen(false);
                          }}
                          className="flex items-center gap-3"
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={r.avatar_url ?? undefined} />
                            <AvatarFallback className="text-xs">
                              {r.full_name?.charAt(0) ?? "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0 text-left">
                            <p className="font-medium text-sm truncate">{r.full_name}</p>
                            {r.email && (
                              <p className="text-xs text-muted-foreground truncate">
                                {r.email}
                              </p>
                            )}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label htmlFor="refer-notes">Context / Message *</Label>
            <Textarea
              id="refer-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Brief description of what the client needs..."
              rows={4}
              required
              minLength={10}
              maxLength={1000}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {notes.length}/1000 characters (min 10)
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || !selectedRecipient || notes.trim().length < 10}
            >
              {submitting ? "Sending..." : "Refer Client"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
