-- Fix: Ensure all tables exist and add missing service role policies
-- This migration is idempotent (safe to run multiple times)

-- 1. Create tables if they don't exist
CREATE TABLE IF NOT EXISTS public.search_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  term TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  geo TEXT DEFAULT '',
  searched_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.trend_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  term TEXT NOT NULL,
  geo TEXT DEFAULT '',
  avg_score INTEGER CHECK (avg_score >= 0 AND avg_score <= 100),
  max_score INTEGER CHECK (max_score >= 0 AND max_score <= 100),
  min_score INTEGER CHECK (min_score >= 0 AND min_score <= 100),
  delta_7d INTEGER,
  data JSONB,
  captured_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.trend_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  term TEXT NOT NULL,
  summary TEXT,
  forecast JSONB,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  term TEXT NOT NULL,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, term)
);

-- 2. Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_search_logs_term ON public.search_logs(term);
CREATE INDEX IF NOT EXISTS idx_search_logs_searched_at ON public.search_logs(searched_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_logs_user_id ON public.search_logs(user_id);

CREATE INDEX IF NOT EXISTS idx_trend_snapshots_term_geo ON public.trend_snapshots(term, geo);
CREATE INDEX IF NOT EXISTS idx_trend_snapshots_captured_at ON public.trend_snapshots(captured_at DESC);

CREATE INDEX IF NOT EXISTS idx_trend_insights_term ON public.trend_insights(term);
CREATE INDEX IF NOT EXISTS idx_trend_insights_generated_at ON public.trend_insights(generated_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON public.user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_saved_at ON public.user_favorites(saved_at DESC);

-- 3. Enable RLS
ALTER TABLE public.search_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trend_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trend_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policies if they exist (to avoid duplicates)
DROP POLICY IF EXISTS "Anyone can read search logs" ON public.search_logs;
DROP POLICY IF EXISTS "Users can insert their own searches" ON public.search_logs;
DROP POLICY IF EXISTS "Service role can insert search logs" ON public.search_logs;

DROP POLICY IF EXISTS "Anyone can read trend snapshots" ON public.trend_snapshots;
DROP POLICY IF EXISTS "Service role can insert snapshots" ON public.trend_snapshots;
DROP POLICY IF EXISTS "Service role can update snapshots" ON public.trend_snapshots;

DROP POLICY IF EXISTS "Anyone can read trend insights" ON public.trend_insights;

DROP POLICY IF EXISTS "Users can view their own favorites" ON public.user_favorites;
DROP POLICY IF EXISTS "Users can insert their own favorites" ON public.user_favorites;
DROP POLICY IF EXISTS "Users can delete their own favorites" ON public.user_favorites;

-- 5. Recreate policies with service role support

-- search_logs policies
CREATE POLICY "Anyone can read search logs"
  ON public.search_logs FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own searches"
  ON public.search_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- CRITICAL: Allow service role to insert search logs (for backend)
CREATE POLICY "Service role can insert search logs"
  ON public.search_logs FOR INSERT
  TO service_role
  WITH CHECK (true);

-- trend_snapshots policies
CREATE POLICY "Anyone can read trend snapshots"
  ON public.trend_snapshots FOR SELECT
  USING (true);

-- CRITICAL: Allow service role to insert/update snapshots (for backend caching)
CREATE POLICY "Service role can insert snapshots"
  ON public.trend_snapshots FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update snapshots"
  ON public.trend_snapshots FOR UPDATE
  TO service_role
  USING (true);

-- trend_insights policies
CREATE POLICY "Anyone can read trend insights"
  ON public.trend_insights FOR SELECT
  USING (true);

-- user_favorites policies
CREATE POLICY "Users can view their own favorites"
  ON public.user_favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites"
  ON public.user_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
  ON public.user_favorites FOR DELETE
  USING (auth.uid() = user_id);

-- 6. Add comments for documentation
COMMENT ON TABLE public.search_logs IS 'Log of all trend searches performed by users';
COMMENT ON TABLE public.trend_snapshots IS 'Cached aggregated trend data to reduce Google Trends API calls';
COMMENT ON TABLE public.trend_insights IS 'AI-generated insights and forecasts for trends';
COMMENT ON TABLE public.user_favorites IS 'User-saved favorite search terms';
