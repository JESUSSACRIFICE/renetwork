"use client";

import { useAuth } from "@/hooks/use-auth";
import { useUserNotifications } from "@/hooks/use-notifications";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Bell } from "lucide-react";
import Link from "next/link";
import type { UserNotification } from "@/lib/notification-types";

interface DashboardNotificationsProps {
  userType: "service_provider" | "agent";
}

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

export function DashboardNotifications({
  userType,
}: DashboardNotificationsProps) {
  const { user } = useAuth();
  const { data: notifications = [], isLoading } = useUserNotifications(
    user?.id ?? null,
    5
  );

  return (
    <Card className="bg-white">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold text-gray-900">
          Notifications
        </CardTitle>
        {notifications.length > 0 && (
          <Link
            href="/dashboard/notifications"
            className="text-sm text-primary hover:underline"
          >
            View all
          </Link>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-6 text-gray-500">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2" />
            <p className="text-xs">Loading...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No notifications</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((n) => (
              <Link
                key={n.id}
                href={n.link_url ?? "/dashboard/notifications"}
                className="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0 hover:bg-gray-50/50 -mx-2 px-2 py-1 rounded"
              >
                <div className="mt-1">
                  <NotificationIcon type={n.type} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{n.title}</p>
                  {n.message && (
                    <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">
                      {n.message}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {formatTimeAgo(n.created_at)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
