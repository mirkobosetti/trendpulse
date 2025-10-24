/**
 * Migration: Create Trends Table
 *
 * Crea la tabella 'trends' per memorizzare i dati di analisi trend.
 * Include RLS (Row Level Security) policies per sicurezza.
 */

-- Create trends table
CREATE TABLE IF NOT EXISTS public.trends (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  term VARCHAR(255) NOT NULL,
  search_date DATE NOT NULL DEFAULT CURRENT_DATE,
  interest_score INTEGER NOT NULL CHECK (interest_score >= 0 AND interest_score <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_trends_term ON public.trends(term);
CREATE INDEX idx_trends_search_date ON public.trends(search_date);
CREATE INDEX idx_trends_term_date ON public.trends(term, search_date);

-- Add comments for documentation
COMMENT ON TABLE public.trends IS 'Stores trend analysis data for keywords';
COMMENT ON COLUMN public.trends.id IS 'Unique identifier for each trend record';
COMMENT ON COLUMN public.trends.term IS 'The keyword being tracked';
COMMENT ON COLUMN public.trends.search_date IS 'The date for this trend data point';
COMMENT ON COLUMN public.trends.interest_score IS 'Interest score from 0-100';
COMMENT ON COLUMN public.trends.created_at IS 'Timestamp when record was created';
COMMENT ON COLUMN public.trends.updated_at IS 'Timestamp when record was last updated';

-- Enable Row Level Security
ALTER TABLE public.trends ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to read trends (public data)
CREATE POLICY "Allow public read access" ON public.trends
  FOR SELECT USING (true);

-- Policy: Only authenticated users can insert trends
CREATE POLICY "Allow authenticated insert" ON public.trends
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy: Only authenticated users can update their own trends
CREATE POLICY "Allow authenticated update" ON public.trends
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Policy: Only authenticated users can delete trends
CREATE POLICY "Allow authenticated delete" ON public.trends
  FOR DELETE USING (auth.role() = 'authenticated');

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at column
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.trends
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
