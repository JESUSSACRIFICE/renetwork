-- Notification Automation
-- Central hub for referrals, offers, commissions, payments per requirements

-- Ensure handle_updated_at exists (used by notification_preferences)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 1. User notifications (unified in-app hub)
CREATE TABLE IF NOT EXISTS public.user_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN (
    'referral_received',
    'referral_accepted',
    'referral_converted',
    'offer_received',
    'offer_accepted',
    'offer_declined',
    'commission_paid',
    'payment_received',
    'crowdfunding_update',
    'training_request',
    'general'
  )),
  title text NOT NULL,
  message text,
  link_url text,
  entity_type text,
  entity_id uuid,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_notifications_user ON public.user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_read ON public.user_notifications(user_id, read_at);
CREATE INDEX IF NOT EXISTS idx_user_notifications_created ON public.user_notifications(created_at DESC);

ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON public.user_notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications (mark read)"
  ON public.user_notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Inserts via SECURITY DEFINER triggers (postgres bypasses RLS)

-- 2. Notification preferences (push, email, SMS, frequency)
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email_enabled boolean DEFAULT true,
  push_enabled boolean DEFAULT true,
  sms_enabled boolean DEFAULT false,
  frequency text DEFAULT 'realtime' CHECK (frequency IN ('realtime', 'daily', 'weekly', 'off')),
  referral_alerts boolean DEFAULT true,
  offer_alerts boolean DEFAULT true,
  payment_alerts boolean DEFAULT true,
  crowdfunding_alerts boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences"
  ON public.notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON public.notification_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON public.notification_preferences FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3. Trigger: New referral -> notify recipient (PSP)
CREATE OR REPLACE FUNCTION public.notify_referral_received()
RETURNS TRIGGER AS $$
DECLARE
  referrer_name text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT COALESCE(full_name, 'Someone') INTO referrer_name
    FROM public.profiles WHERE id = NEW.referrer_id;
    INSERT INTO public.user_notifications (user_id, type, title, message, link_url, entity_type, entity_id)
    VALUES (
      NEW.recipient_profile_id,
      'referral_received',
      'New referral received',
      referrer_name || ' sent you a referral.',
      '/dashboard/referrals-in',
      'referral',
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_notify_referral_received ON public.referrals;
CREATE TRIGGER trigger_notify_referral_received
  AFTER INSERT ON public.referrals
  FOR EACH ROW EXECUTE FUNCTION public.notify_referral_received();

-- 4. Trigger: Referral status change -> notify referrer
CREATE OR REPLACE FUNCTION public.notify_referral_status_changed()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    IF NEW.status = 'accepted' THEN
      INSERT INTO public.user_notifications (user_id, type, title, message, link_url, entity_type, entity_id)
      VALUES (
        NEW.referrer_id,
        'referral_accepted',
        'Referral accepted',
        'Your referral has been accepted by the recipient.',
        '/dashboard/referral',
        'referral',
        NEW.id
      );
    ELSIF NEW.status = 'converted' THEN
      INSERT INTO public.user_notifications (user_id, type, title, message, link_url, entity_type, entity_id)
      VALUES (
        NEW.referrer_id,
        'referral_converted',
        'Referral converted',
        'Your referral has converted! Commission may be on the way.',
        '/dashboard/referral',
        'referral',
        NEW.id
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_notify_referral_status ON public.referrals;
CREATE TRIGGER trigger_notify_referral_status
  AFTER UPDATE ON public.referrals
  FOR EACH ROW EXECUTE FUNCTION public.notify_referral_status_changed();

-- 5. Trigger: New offer -> notify recipient
CREATE OR REPLACE FUNCTION public.notify_offer_received()
RETURNS TRIGGER AS $$
DECLARE
  sender_name text;
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'pending' THEN
    SELECT COALESCE(full_name, 'A professional') INTO sender_name
    FROM public.profiles WHERE id = NEW.sender_id;
    INSERT INTO public.user_notifications (user_id, type, title, message, link_url, entity_type, entity_id)
    VALUES (
      NEW.recipient_id,
      'offer_received',
      'New offer received',
      sender_name || ' sent you an offer: ' || NEW.title,
      '/dashboard/messages',
      'offer',
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_notify_offer_received ON public.offers;
CREATE TRIGGER trigger_notify_offer_received
  AFTER INSERT ON public.offers
  FOR EACH ROW EXECUTE FUNCTION public.notify_offer_received();

-- 6. Trigger: Offer accepted/declined -> notify sender
CREATE OR REPLACE FUNCTION public.notify_offer_response()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.status = 'pending' AND NEW.status IN ('accepted', 'declined') THEN
    IF NEW.status = 'accepted' THEN
      INSERT INTO public.user_notifications (user_id, type, title, message, link_url, entity_type, entity_id)
      VALUES (
        NEW.sender_id,
        'offer_accepted',
        'Offer accepted',
        'Your offer "' || NEW.title || '" was accepted.',
        '/dashboard/messages',
        'offer',
        NEW.id
      );
    ELSE
      INSERT INTO public.user_notifications (user_id, type, title, message, link_url, entity_type, entity_id)
      VALUES (
        NEW.sender_id,
        'offer_declined',
        'Offer declined',
        'Your offer "' || NEW.title || '" was declined.',
        '/dashboard/messages',
        'offer',
        NEW.id
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_notify_offer_response ON public.offers;
CREATE TRIGGER trigger_notify_offer_response
  AFTER UPDATE ON public.offers
  FOR EACH ROW EXECUTE FUNCTION public.notify_offer_response();

-- 7. Trigger: Commission paid -> notify referrer
CREATE OR REPLACE FUNCTION public.notify_commission_paid()
RETURNS TRIGGER AS $$
DECLARE
  ref_referrer_id uuid;
  amt text;
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.status <> 'paid' AND NEW.status = 'paid' THEN
    SELECT referrer_id INTO ref_referrer_id FROM public.referrals WHERE id = NEW.referral_id;
    amt := (NEW.amount_cents / 100.0)::text;
    INSERT INTO public.user_notifications (user_id, type, title, message, link_url, entity_type, entity_id)
    VALUES (
      ref_referrer_id,
      'commission_paid',
      'Commission paid',
      'You received $' || amt || ' from a converted referral.',
      '/dashboard/referral',
      'commission',
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_notify_commission_paid ON public.referral_commissions;
CREATE TRIGGER trigger_notify_commission_paid
  AFTER UPDATE ON public.referral_commissions
  FOR EACH ROW EXECUTE FUNCTION public.notify_commission_paid();

-- 8. Sync crowdfunding notifications to user_notifications (optional - keep both for now)
-- Crowdfunding has its own table; we could add a trigger to also insert into user_notifications
-- For now, the crowdfunding flow stays as-is. The central hub will aggregate from both tables via the app.

-- 9. Updated_at for preferences
CREATE TRIGGER set_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

COMMENT ON TABLE public.user_notifications IS 'Central notification hub: referrals, offers, commissions, payments';
COMMENT ON TABLE public.notification_preferences IS 'User preferences: push, email, SMS, frequency per requirements';
  