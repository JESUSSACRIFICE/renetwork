"use client";

import { useAuth } from "@/hooks/use-auth";
import {
  useUserNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "@/hooks/use-notifications";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Bell, CheckCheck } from "lucide-react";
import Link from "next/link";
import type { UserNotification } from "@/lib/notification-types";

function formatTimeAgo(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const sec = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (sec < 60) return "Just now";
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  if (sec < 604800) return `${Math.floor(sec / 86400)}d ago`;
  return d.toLocaleDateString();
}

function NotificationIcon({ type }: { type: UserNotification["type"] }) {
  const iconClass = "w-5 h-5 flex-shrink-0";
  switch (type) {
    case "referral_received":
    case "referral_accepted":
    case "referral_converted":
    case "commission_paid":
      return <Bell className={`${iconClass} text-green-600`} />;
    case "offer_received":
    case "offer_accepted":
    case "offer_declined":
      return <MessageSquare className={`${iconClass} text-blue-600`} />;
    default:
      return <Bell className={`${iconClass} text-gray-600`} />;
  }
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const { data: notifications = [], isLoading } = useUserNotifications(
    user?.id ?? null
  );
  const markRead = useMarkNotificationRead(user?.id ?? null);
  const markAllRead = useMarkAllNotificationsRead(user?.id ?? null);

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
          >
            <CheckCheck className="w-4 h-4 mr-2" />
            Mark all as read
          </Button>
        )}
      </div>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900">
            All notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
              <p className="text-sm">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No notifications yet</p>
              <p className="text-xs mt-1 text-gray-400">
                You&apos;ll see referrals, offers, and payments here
              </p>
            </div>
          ) : (
            <div className="space-y-0 divide-y divide-gray-100">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 py-4 first:pt-0 ${
                    !n.read_at ? "bg-primary/5" : ""
                  }`}
                >
                  <div className="mt-0.5">
                    <NotificationIcon type={n.type} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {n.title}
                        </p>
                        {n.message && (
                          <p className="text-sm text-gray-600 mt-0.5">
                            {n.message}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(n.created_at)}
                        </span>
                        {!n.read_at && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => markRead.mutate(n.id)}
                            disabled={markRead.isPending}
                          >
                            Mark read
                          </Button>
                        )}
                      </div>
                    </div>
                    {n.link_url && (
                      <Link
                        href={n.link_url}
                        className="text-sm text-primary hover:underline mt-1 inline-block"
                      >
                        View details →
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
