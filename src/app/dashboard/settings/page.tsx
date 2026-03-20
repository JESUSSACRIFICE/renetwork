"use client";

import { useAuth } from "@/hooks/use-auth";
import {
  useNotificationPreferences,
  useUpsertNotificationPreferences,
} from "@/hooks/use-notifications";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bell } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();
  const { data: prefs, isLoading } = useNotificationPreferences(
    user?.id ?? null
  );
  const upsert = useUpsertNotificationPreferences(user?.id ?? null);

  const handleToggle = (key: string, value: boolean) => {
    upsert.mutate({ [key]: value });
  };

  const handleFrequency = (value: string) => {
    upsert.mutate({
      frequency: value as "realtime" | "daily" | "weekly" | "off",
    });
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

      {/* Notification Preferences */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading ? (
            <p className="text-gray-500">Loading preferences...</p>
          ) : (
            <>
              <div className="space-y-4">
                <Label className="text-base font-medium">Channels</Label>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Email notifications</span>
                  <Switch
                    checked={prefs?.email_enabled ?? true}
                    onCheckedChange={(v) => handleToggle("email_enabled", v)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Push notifications</span>
                  <Switch
                    checked={prefs?.push_enabled ?? true}
                    onCheckedChange={(v) => handleToggle("push_enabled", v)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">SMS notifications</span>
                  <Switch
                    checked={prefs?.sms_enabled ?? false}
                    onCheckedChange={(v) => handleToggle("sms_enabled", v)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-base font-medium">Frequency</Label>
                <Select
                  value={prefs?.frequency ?? "realtime"}
                  onValueChange={handleFrequency}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realtime">Real-time</SelectItem>
                    <SelectItem value="daily">Daily digest</SelectItem>
                    <SelectItem value="weekly">Weekly digest</SelectItem>
                    <SelectItem value="off">Off</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label className="text-base font-medium">Categories</Label>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Referral alerts</span>
                  <Switch
                    checked={prefs?.referral_alerts ?? true}
                    onCheckedChange={(v) => handleToggle("referral_alerts", v)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Offer alerts</span>
                  <Switch
                    checked={prefs?.offer_alerts ?? true}
                    onCheckedChange={(v) => handleToggle("offer_alerts", v)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Payment alerts</span>
                  <Switch
                    checked={prefs?.payment_alerts ?? true}
                    onCheckedChange={(v) => handleToggle("payment_alerts", v)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Crowdfunding alerts</span>
                  <Switch
                    checked={prefs?.crowdfunding_alerts ?? true}
                    onCheckedChange={(v) => handleToggle("crowdfunding_alerts", v)}
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
