-- Add leaderboard_visibility column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'leaderboard_visibility') THEN
        ALTER TABLE profiles ADD COLUMN leaderboard_visibility text DEFAULT 'visible';
        ALTER TABLE profiles ADD CONSTRAINT leaderboard_visibility_check CHECK (leaderboard_visibility IN ('visible', 'anonymous', 'hidden'));
    END IF;
END $$;

-- Add preferred_word_list column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'preferred_word_list') THEN
        ALTER TABLE profiles ADD COLUMN preferred_word_list text DEFAULT 'general';
        ALTER TABLE profiles ADD CONSTRAINT preferred_word_list_check CHECK (preferred_word_list IN ('general', 'academic', 'business', 'toefl', 'ielts'));
    END IF;
END $$;

-- Add difficulty_level column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'difficulty_level') THEN
        ALTER TABLE profiles ADD COLUMN difficulty_level text DEFAULT 'mixed';
        ALTER TABLE profiles ADD CONSTRAINT difficulty_level_check CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'mixed'));
    END IF;
END $$;
