-- Vocasun Performance Optimization Migration
-- Run this in your Supabase SQL Editor

-- 1. Create a function to efficiently get random words
-- This avoids fetching ALL ids to the client, which is very slow for large datasets.
CREATE OR REPLACE FUNCTION get_random_words(
  limit_count int
)
RETURNS SETOF vocabulary
LANGUAGE sql
AS $$
  SELECT *
  FROM vocabulary
  ORDER BY random()
  LIMIT limit_count;
$$;

-- Note: This function returns a set of 'vocabulary' rows.
-- Usage in client: supabase.rpc('get_random_words', { limit_count: 10 })
