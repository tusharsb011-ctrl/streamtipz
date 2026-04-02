-- ==========================================
-- StreamTipz — Full Supabase Database Schema
-- ==========================================
-- Instructions: 
-- 1. Create a new Supabase project at https://database.supabase.com/
-- 2. Open the "SQL Editor" in the Supabase Dashboard.
-- 3. Copy and paste this entire file and click "Run".
-- ==========================================

-- ── 1. Create `profiles` table ──────────
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'creator',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ── 2. Create `creator_settings` table ──
CREATE TABLE IF NOT EXISTS public.creator_settings (
    creator_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    upi_id TEXT,
    upi_name TEXT,
    min_tip_amount NUMERIC(10, 2) DEFAULT 10,
    payment_enabled BOOLEAN DEFAULT true,
    tip_page_message TEXT DEFAULT 'Support my content! Every tip helps me create more awesome content for you 💜',
    show_leaderboard BOOLEAN DEFAULT true,
    thank_you_message TEXT DEFAULT 'Thank you so much for your support! 🎉',
    alert_theme TEXT DEFAULT 'default',
    alert_sound TEXT,
    currency TEXT DEFAULT 'INR',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── 3. Create `tips` table ──────────────
CREATE TABLE IF NOT EXISTS public.tips (
    id BIGSERIAL PRIMARY KEY,
    creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    sender_name TEXT NOT NULL,
    message TEXT,
    amount NUMERIC(10, 2) NOT NULL,
    payment_code TEXT DEFAULT NULL,
    platform_fee NUMERIC(10, 2) DEFAULT 0,
    creator_earnings NUMERIC(10, 2) DEFAULT 0,
    razorpay_order_id TEXT DEFAULT NULL,
    razorpay_payment_id TEXT DEFAULT NULL,
    status TEXT DEFAULT 'verified',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ── 4. Create `payment_codes` table ─────
CREATE TABLE IF NOT EXISTS public.payment_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) DEFAULT NULL,
    message_template TEXT DEFAULT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast code lookups (QR scan resolution)
CREATE INDEX IF NOT EXISTS idx_payment_codes_code ON public.payment_codes(code);
CREATE INDEX IF NOT EXISTS idx_payment_codes_creator ON public.payment_codes(creator_id);

-- ── 5. Create `payment_notifications` table ──
CREATE TABLE IF NOT EXISTS public.payment_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    tip_id INT8 REFERENCES public.tips(id) ON DELETE SET NULL,
    type TEXT NOT NULL DEFAULT 'tip_received',
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast notification lookups
CREATE INDEX IF NOT EXISTS idx_notifications_creator ON public.payment_notifications(creator_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.payment_notifications(creator_id, is_read) WHERE is_read = FALSE;

-- ==========================================
-- ── ENABLE ROW LEVEL SECURITY (RLS) ───────
-- ==========================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_notifications ENABLE ROW LEVEL SECURITY;

-- Disable RLS selectively so Backend and Client work easily out of the box
-- Security Note: Update these in production to better limit permissions!
CREATE POLICY "Public profiles are viewable by everyone." 
    ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." 
    ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile." 
    ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Public settings are viewable by everyone." 
    ON public.creator_settings FOR SELECT USING (true);
CREATE POLICY "Users can insert their own settings." 
    ON public.creator_settings FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Users can update their own settings." 
    ON public.creator_settings FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "Public tips are viewable by everyone." 
    ON public.tips FOR SELECT USING (true);
CREATE POLICY "Tips can be inserted by everyone." 
    ON public.tips FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can read active payment codes."
    ON public.payment_codes FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Creators can insert their own codes."
    ON public.payment_codes FOR INSERT WITH CHECK (true);
CREATE POLICY "Creators can update their own codes."
    ON public.payment_codes FOR UPDATE USING (true);

CREATE POLICY "Creators can read their own notifications."
    ON public.payment_notifications FOR SELECT USING (true);
CREATE POLICY "Service can insert notifications."
    ON public.payment_notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Creators can update their own notifications."
    ON public.payment_notifications FOR UPDATE USING (true);

-- ==========================================
-- ── AUTO-CREATOR TRIGGER ──────────────────
-- ==========================================
-- Automatically create default creator settings 
-- when entering a new profile record 

CREATE OR REPLACE FUNCTION public.handle_new_user_settings()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NEW.role = 'creator' THEN
    INSERT INTO public.creator_settings (creator_id)
    VALUES (NEW.id)
    ON CONFLICT (creator_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_settings();

-- ==========================================
-- ✅ Complete Setup Initialization Successful
-- ==========================================
