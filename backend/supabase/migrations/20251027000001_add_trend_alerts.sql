-- Migration: Add Trend Alerts functionality
-- This migration adds alert-related columns to user_favorites table
-- and creates alert_logs table for tracking sent notifications

-- 1. Add alert columns to user_favorites table
ALTER TABLE public.user_favorites
  ADD COLUMN IF NOT EXISTS alert_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS alert_threshold INTEGER DEFAULT 20 CHECK (alert_threshold > 0 AND alert_threshold <= 100),
  ADD COLUMN IF NOT EXISTS alert_frequency TEXT DEFAULT 'daily' CHECK (alert_frequency IN ('daily', '6hours', 'hourly')),
  ADD COLUMN IF NOT EXISTS last_check_score INTEGER CHECK (last_check_score >= 0 AND last_check_score <= 100),
  ADD COLUMN IF NOT EXISTS last_check_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS geo TEXT DEFAULT '';

-- 2. Create alert_logs table to track sent alerts
CREATE TABLE IF NOT EXISTS public.alert_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  favorite_id UUID REFERENCES public.user_favorites(id) ON DELETE CASCADE NOT NULL,
  term TEXT NOT NULL,
  geo TEXT DEFAULT '',
  old_score INTEGER CHECK (old_score >= 0 AND old_score <= 100),
  new_score INTEGER CHECK (new_score >= 0 AND new_score <= 100),
  change_percent DECIMAL(5,2) NOT NULL,
  alert_type TEXT DEFAULT 'threshold' CHECK (alert_type IN ('threshold', 'spike', 'drop')),
  email_sent BOOLEAN DEFAULT false,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_favorites_alert_enabled ON public.user_favorites(alert_enabled) WHERE alert_enabled = true;
CREATE INDEX IF NOT EXISTS idx_user_favorites_last_check ON public.user_favorites(last_check_at);
CREATE INDEX IF NOT EXISTS idx_alert_logs_user_id ON public.alert_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_alert_logs_sent_at ON public.alert_logs(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_alert_logs_favorite_id ON public.alert_logs(favorite_id);

-- 4. Enable RLS on alert_logs
ALTER TABLE public.alert_logs ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for alert_logs
DROP POLICY IF EXISTS "Users can view their own alert logs" ON public.alert_logs;
DROP POLICY IF EXISTS "Service role can insert alert logs" ON public.alert_logs;

CREATE POLICY "Users can view their own alert logs"
  ON public.alert_logs FOR SELECT
  USING (auth.uid() = user_id);

-- CRITICAL: Allow service role to insert alert logs (for Edge Function)
CREATE POLICY "Service role can insert alert logs"
  ON public.alert_logs FOR INSERT
  TO service_role
  WITH CHECK (true);

-- 6. Update existing user_favorites policies to allow service role updates
DROP POLICY IF EXISTS "Service role can update favorites" ON public.user_favorites;

CREATE POLICY "Service role can update favorites"
  ON public.user_favorites FOR UPDATE
  TO service_role
  USING (true);

CREATE POLICY "Service role can read all favorites"
  ON public.user_favorites FOR SELECT
  TO service_role
  USING (true);

-- 7. Add helpful comments
COMMENT ON COLUMN public.user_favorites.alert_enabled IS 'Whether user wants to receive alerts for this trend';
COMMENT ON COLUMN public.user_favorites.alert_threshold IS 'Percentage change required to trigger alert (1-100)';
COMMENT ON COLUMN public.user_favorites.alert_frequency IS 'How often to check: daily, 6hours, or hourly';
COMMENT ON COLUMN public.user_favorites.last_check_score IS 'Last recorded score for comparison';
COMMENT ON COLUMN public.user_favorites.last_check_at IS 'Timestamp of last alert check';
COMMENT ON COLUMN public.user_favorites.geo IS 'Geographic location for this favorite (e.g., US, IT, GB)';
COMMENT ON TABLE public.alert_logs IS 'Log of all trend alerts sent to users';
