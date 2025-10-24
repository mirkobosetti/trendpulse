-- Drop old trends table (no longer needed - data comes from Google Trends API)
DROP TABLE IF EXISTS public.trends CASCADE;

-- 1️⃣ Search logs - track what users search for
CREATE TABLE public.search_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  term TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  geo TEXT DEFAULT '', -- geographic location for the search
  searched_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index for fast lookups and analytics
CREATE INDEX idx_search_logs_term ON public.search_logs(term);
CREATE INDEX idx_search_logs_searched_at ON public.search_logs(searched_at DESC);
CREATE INDEX idx_search_logs_user_id ON public.search_logs(user_id);

-- 2️⃣ Trend snapshots - cached aggregated data (avoid repeated API calls)
CREATE TABLE public.trend_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  term TEXT NOT NULL,
  geo TEXT DEFAULT '',
  avg_score INTEGER CHECK (avg_score >= 0 AND avg_score <= 100),
  max_score INTEGER CHECK (max_score >= 0 AND max_score <= 100),
  min_score INTEGER CHECK (min_score >= 0 AND min_score <= 100),
  delta_7d INTEGER, -- change from 7 days ago
  data JSONB, -- store full timeline data [{date, value}, ...]
  captured_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index for cache lookups (term + geo + recency)
CREATE INDEX idx_trend_snapshots_term_geo ON public.trend_snapshots(term, geo);
CREATE INDEX idx_trend_snapshots_captured_at ON public.trend_snapshots(captured_at DESC);

-- 3️⃣ Trend insights - AI-generated summaries and forecasts (future use)
CREATE TABLE public.trend_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  term TEXT NOT NULL,
  summary TEXT, -- AI-generated summary
  forecast JSONB, -- predicted values for next 7-14 days
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_trend_insights_term ON public.trend_insights(term);
CREATE INDEX idx_trend_insights_generated_at ON public.trend_insights(generated_at DESC);

-- 4️⃣ User favorites - save favorite searches (for authenticated users)
CREATE TABLE public.user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  term TEXT NOT NULL,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, term) -- prevent duplicates
);

CREATE INDEX idx_user_favorites_user_id ON public.user_favorites(user_id);
CREATE INDEX idx_user_favorites_saved_at ON public.user_favorites(saved_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.search_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trend_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trend_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- search_logs: anyone can read, only authenticated users can insert their own
CREATE POLICY "Anyone can read search logs"
  ON public.search_logs FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own searches"
  ON public.search_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- trend_snapshots: anyone can read (it's cached public data)
CREATE POLICY "Anyone can read trend snapshots"
  ON public.trend_snapshots FOR SELECT
  USING (true);

-- Only service role can insert/update snapshots (done by backend)
-- (no user policy needed - backend uses service_role_key)

-- trend_insights: anyone can read
CREATE POLICY "Anyone can read trend insights"
  ON public.trend_insights FOR SELECT
  USING (true);

-- user_favorites: users can only see/manage their own favorites
CREATE POLICY "Users can view their own favorites"
  ON public.user_favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites"
  ON public.user_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
  ON public.user_favorites FOR DELETE
  USING (auth.uid() = user_id);

-- Comments for documentation
COMMENT ON TABLE public.search_logs IS 'Log of all trend searches performed by users';
COMMENT ON TABLE public.trend_snapshots IS 'Cached aggregated trend data to reduce Google Trends API calls';
COMMENT ON TABLE public.trend_insights IS 'AI-generated insights and forecasts for trends';
COMMENT ON TABLE public.user_favorites IS 'User-saved favorite search terms';
