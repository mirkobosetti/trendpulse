/**
 * Seed Data for TrendPulse Database
 *
 * Popola il database con dati demo per sviluppo e testing.
 * Eseguito automaticamente da `db:reset` o manualmente con `db:seed`.
 */

-- Clear existing data (only in development!)
TRUNCATE public.trends CASCADE;

-- Insert sample trend data for "React"
INSERT INTO public.trends (term, search_date, interest_score) VALUES
  ('React', CURRENT_DATE - INTERVAL '29 days', 78),
  ('React', CURRENT_DATE - INTERVAL '28 days', 82),
  ('React', CURRENT_DATE - INTERVAL '27 days', 75),
  ('React', CURRENT_DATE - INTERVAL '26 days', 88),
  ('React', CURRENT_DATE - INTERVAL '25 days', 91),
  ('React', CURRENT_DATE - INTERVAL '24 days', 85),
  ('React', CURRENT_DATE - INTERVAL '23 days', 79),
  ('React', CURRENT_DATE - INTERVAL '22 days', 83),
  ('React', CURRENT_DATE - INTERVAL '21 days', 90),
  ('React', CURRENT_DATE - INTERVAL '20 days', 87),
  ('React', CURRENT_DATE - INTERVAL '19 days', 84),
  ('React', CURRENT_DATE - INTERVAL '18 days', 92),
  ('React', CURRENT_DATE - INTERVAL '17 days', 88),
  ('React', CURRENT_DATE - INTERVAL '16 days', 86),
  ('React', CURRENT_DATE - INTERVAL '15 days', 89),
  ('React', CURRENT_DATE - INTERVAL '14 days', 85),
  ('React', CURRENT_DATE - INTERVAL '13 days', 81),
  ('React', CURRENT_DATE - INTERVAL '12 days', 87),
  ('React', CURRENT_DATE - INTERVAL '11 days', 93),
  ('React', CURRENT_DATE - INTERVAL '10 days', 90),
  ('React', CURRENT_DATE - INTERVAL '9 days', 88),
  ('React', CURRENT_DATE - INTERVAL '8 days', 85),
  ('React', CURRENT_DATE - INTERVAL '7 days', 91),
  ('React', CURRENT_DATE - INTERVAL '6 days', 89),
  ('React', CURRENT_DATE - INTERVAL '5 days', 94),
  ('React', CURRENT_DATE - INTERVAL '4 days', 92),
  ('React', CURRENT_DATE - INTERVAL '3 days', 87),
  ('React', CURRENT_DATE - INTERVAL '2 days', 90),
  ('React', CURRENT_DATE - INTERVAL '1 day', 95),
  ('React', CURRENT_DATE, 93);

-- Insert sample trend data for "TypeScript"
INSERT INTO public.trends (term, search_date, interest_score) VALUES
  ('TypeScript', CURRENT_DATE - INTERVAL '29 days', 68),
  ('TypeScript', CURRENT_DATE - INTERVAL '28 days', 72),
  ('TypeScript', CURRENT_DATE - INTERVAL '27 days', 75),
  ('TypeScript', CURRENT_DATE - INTERVAL '26 days', 71),
  ('TypeScript', CURRENT_DATE - INTERVAL '25 days', 78),
  ('TypeScript', CURRENT_DATE - INTERVAL '24 days', 80),
  ('TypeScript', CURRENT_DATE - INTERVAL '23 days', 76),
  ('TypeScript', CURRENT_DATE - INTERVAL '22 days', 82),
  ('TypeScript', CURRENT_DATE - INTERVAL '21 days', 85),
  ('TypeScript', CURRENT_DATE - INTERVAL '20 days', 83),
  ('TypeScript', CURRENT_DATE - INTERVAL '19 days', 79),
  ('TypeScript', CURRENT_DATE - INTERVAL '18 days', 87),
  ('TypeScript', CURRENT_DATE - INTERVAL '17 days', 84),
  ('TypeScript', CURRENT_DATE - INTERVAL '16 days', 81),
  ('TypeScript', CURRENT_DATE - INTERVAL '15 days', 88),
  ('TypeScript', CURRENT_DATE - INTERVAL '14 days', 86),
  ('TypeScript', CURRENT_DATE - INTERVAL '13 days', 82),
  ('TypeScript', CURRENT_DATE - INTERVAL '12 days', 89),
  ('TypeScript', CURRENT_DATE - INTERVAL '11 days', 91),
  ('TypeScript', CURRENT_DATE - INTERVAL '10 days', 90),
  ('TypeScript', CURRENT_DATE - INTERVAL '9 days', 87),
  ('TypeScript', CURRENT_DATE - INTERVAL '8 days', 85),
  ('TypeScript', CURRENT_DATE - INTERVAL '7 days', 92),
  ('TypeScript', CURRENT_DATE - INTERVAL '6 days', 88),
  ('TypeScript', CURRENT_DATE - INTERVAL '5 days', 94),
  ('TypeScript', CURRENT_DATE - INTERVAL '4 days', 91),
  ('TypeScript', CURRENT_DATE - INTERVAL '3 days', 89),
  ('TypeScript', CURRENT_DATE - INTERVAL '2 days', 93),
  ('TypeScript', CURRENT_DATE - INTERVAL '1 day', 96),
  ('TypeScript', CURRENT_DATE, 95);

-- Insert sample trend data for "Vue"
INSERT INTO public.trends (term, search_date, interest_score) VALUES
  ('Vue', CURRENT_DATE - INTERVAL '14 days', 65),
  ('Vue', CURRENT_DATE - INTERVAL '13 days', 68),
  ('Vue', CURRENT_DATE - INTERVAL '12 days', 72),
  ('Vue', CURRENT_DATE - INTERVAL '11 days', 70),
  ('Vue', CURRENT_DATE - INTERVAL '10 days', 74),
  ('Vue', CURRENT_DATE - INTERVAL '9 days', 77),
  ('Vue', CURRENT_DATE - INTERVAL '8 days', 75),
  ('Vue', CURRENT_DATE - INTERVAL '7 days', 79),
  ('Vue', CURRENT_DATE - INTERVAL '6 days', 81),
  ('Vue', CURRENT_DATE - INTERVAL '5 days', 78),
  ('Vue', CURRENT_DATE - INTERVAL '4 days', 83),
  ('Vue', CURRENT_DATE - INTERVAL '3 days', 80),
  ('Vue', CURRENT_DATE - INTERVAL '2 days', 85),
  ('Vue', CURRENT_DATE - INTERVAL '1 day', 82),
  ('Vue', CURRENT_DATE, 87);

-- Display seeded data summary
DO $$
DECLARE
  total_records INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_records FROM public.trends;
  RAISE NOTICE 'Seed completed! Total records: %', total_records;
END $$;
