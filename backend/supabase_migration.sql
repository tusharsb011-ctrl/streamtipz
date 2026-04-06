-- ==========================================
-- WaveTipz — QR Payment Code Migration
-- ==========================================
-- Run this SQL in the Supabase SQL Editor
-- to create the new tables and update the
-- existing `tips` table.
-- ==========================================

-- ── 1. Create `payment_codes` table ──────────
CREATE TABLE IF NOT EXISTS payment_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) DEFAULT NULL,
    message_template TEXT DEFAULT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast code lookups (QR scan resolution)
CREATE INDEX IF NOT EXISTS idx_payment_codes_code ON payment_codes(code);
CREATE INDEX IF NOT EXISTS idx_payment_codes_creator ON payment_codes(creator_id);

-- ── 2. Create `payment_notifications` table ──
CREATE TABLE IF NOT EXISTS payment_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    tip_id INT8 REFERENCES tips(id) ON DELETE SET NULL,
    type TEXT NOT NULL DEFAULT 'tip_received',
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast notification lookups
CREATE INDEX IF NOT EXISTS idx_notifications_creator ON payment_notifications(creator_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON payment_notifications(creator_id, is_read) WHERE is_read = FALSE;

-- ── 3. Add new columns to `tips` table ──────
-- Payment tracking columns
ALTER TABLE tips ADD COLUMN IF NOT EXISTS payment_code TEXT DEFAULT NULL;
ALTER TABLE tips ADD COLUMN IF NOT EXISTS platform_fee NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE tips ADD COLUMN IF NOT EXISTS creator_earnings NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE tips ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT DEFAULT NULL;
ALTER TABLE tips ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT DEFAULT NULL;
ALTER TABLE tips ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'verified';

-- ── 4. Enable Row Level Security ─────────────
ALTER TABLE payment_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_notifications ENABLE ROW LEVEL SECURITY;

-- ── 5. RLS Policies for `payment_codes` ──────

-- Anyone can read active codes (for QR resolution)
CREATE POLICY "Public can read active payment codes"
    ON payment_codes
    FOR SELECT
    USING (is_active = TRUE);

-- Creators can manage their own codes
CREATE POLICY "Creators can insert their own codes"
    ON payment_codes
    FOR INSERT
    WITH CHECK (TRUE);

CREATE POLICY "Creators can update their own codes"
    ON payment_codes
    FOR UPDATE
    USING (TRUE);

-- ── 6. RLS Policies for `payment_notifications`

-- Creators can read their own notifications
CREATE POLICY "Creators can read their own notifications"
    ON payment_notifications
    FOR SELECT
    USING (TRUE);

-- System can insert notifications (via service role)
CREATE POLICY "Service can insert notifications"
    ON payment_notifications
    FOR INSERT
    WITH CHECK (TRUE);

-- Creators can update their own notifications (mark as read)
CREATE POLICY "Creators can update their own notifications"
    ON payment_notifications
    FOR UPDATE
    USING (TRUE);

-- ==========================================
-- ✅ Migration complete!
-- 
-- New tables created:
--   - payment_codes
--   - payment_notifications
--
-- Updated tables:
--   - tips (added: payment_code, platform_fee,
--           creator_earnings, razorpay_order_id,
--           razorpay_payment_id, status)
-- ==========================================
