-- Add created_at column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'created_at') THEN
        -- 1. Add column (initially null)
        ALTER TABLE profiles ADD COLUMN created_at timestamptz;
        
        -- 2. Set ALL existing rows to 5 days ago (as a fallback default)
        UPDATE profiles SET created_at = (now() - interval '5 days');
        
        -- 3. Set default for FUTURE rows to now()
        ALTER TABLE profiles ALTER COLUMN created_at SET DEFAULT now();
    END IF;
END $$;

-- 4. Try to backfill REAL data from auth.users (will overwrite the 5-day-old date if user exists in auth)
UPDATE profiles
SET created_at = users.created_at
FROM auth.users
WHERE profiles.id = users.id;
