-- ==========================================
-- WaveTips: Viewer/Creator Role Migration
-- Run this in Supabase SQL Editor
-- ==========================================

-- 1. Add 'role' column to profiles if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'role'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'creator';
    END IF;
END $$;

-- 2. Add 'sender_id' column to tips if it doesn't exist
-- This links tips to the authenticated viewer who sent them
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'tips' AND column_name = 'sender_id'
    ) THEN
        ALTER TABLE public.tips ADD COLUMN sender_id UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- 3. Create index for fast viewer tip lookups
CREATE INDEX IF NOT EXISTS idx_tips_sender_id ON public.tips(sender_id);

-- 4. RLS policy: Allow viewers to read their own sent tips
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'tips' AND policyname = 'Viewers can read their sent tips'
    ) THEN
        CREATE POLICY "Viewers can read their sent tips"
            ON public.tips
            FOR SELECT
            USING (sender_id = auth.uid());
    END IF;
END $$;

-- 5. Update existing profiles that have no role to 'creator' (legacy users)
UPDATE public.profiles SET role = 'creator' WHERE role IS NULL;

-- Done!
SELECT 'Migration complete: role & sender_id columns added' AS status;
