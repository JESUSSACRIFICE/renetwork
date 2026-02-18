"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, MessageSquare } from "lucide-react";

interface DashboardNotificationsProps {
  userType: "service_provider" | "agent";
}

export function DashboardNotifications({
  userType,
}: DashboardNotificationsProps) {
  // Sample notifications - in a real app, this would come from your API
  const notifications =
    userType === "buyer"
      ? [] // Empty for employer
      : [
          {
            id: 1,
            icon: FileText,
            message:
              "The application is undo approved on your job Abdul Narrator by Employer.",
            time: "7 months ago",
            color: "text-green-600",
          },
          {
            id: 2,
            icon: FileText,
            message:
              "A new meeting is created on the job Abdul Narrator by Employer.",
            time: "8 months ago",
            color: "text-green-600",
          },
          {
            id: 3,
            icon: FileText,
            message:
              "The application is approved on your job Abdul Narrator by Employer.",
            time: "8 months ago",
            color: "text-green-600",
          },
        ];

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-900">
          Notifications
        </CardTitle>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No notifications</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-0"
              >
                <div className={`${notification.color} mt-1`}>
                  <notification.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {notification.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
