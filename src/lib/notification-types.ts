export type NotificationType =
  | "referral_received"
  | "referral_accepted"
  | "referral_converted"
  | "offer_received"
  | "offer_accepted"
  | "offer_declined"
  | "commission_paid"
  | "payment_received"
  | "crowdfunding_update"
  | "training_request"
  | "general";

export interface UserNotification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string | null;
  link_url: string | null;
  entity_type: string | null;
  entity_id: string | null;
  read_at: string | null;
  created_at: string;
}

export interface NotificationPreferences {
  user_id: string;
  email_enabled: boolean;
  push_enabled: boolean;
  sms_enabled: boolean;
  frequency: "realtime" | "daily" | "weekly" | "off";
  referral_alerts: boolean;
  offer_alerts: boolean;
  payment_alerts: boolean;
  crowdfunding_alerts: boolean;
  created_at: string;
  updated_at: string;
}
