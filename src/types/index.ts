export interface Profile {
    id: string;
    username: string | null;
    first_name: string | null;
    last_name: string | null;
    email: string;
    total_xp: number;
    weekly_xp: number;
    level: number;
    daily_goal: number;
    bio?: string;
    avatar_url?: string;
    display_name_preference: 'username' | 'fullname';
    leaderboard_visibility?: 'visible' | 'anonymous' | 'hidden';
    preferred_word_list?: string[];
    difficulty_level?: 'beginner' | 'intermediate' | 'advanced' | 'mixed';
    accent_preference?: 'US' | 'UK';
    created_at: string;
    marked_for_deletion_at?: string | null;
    is_admin?: boolean;
    email_notifications?: boolean;
    marketing_emails?: boolean;
}

export interface Vocabulary {
    id: number;
    word: string;
    meaning: string;
    type: string;
    level: string;
    example_en: string;
    example_tr: string;
    audio_url?: string;
    audio_us?: string | null;
    audio_uk?: string | null;
    image_url?: string;
    definition?: string;
    phonetic_ipa?: string;
    synonyms?: string[];
    antonyms?: string[];
    ipa_us?: string | null;
    ipa_uk?: string | null;
}

export interface UserProgress {
    id: number;
    user_id: string;
    vocab_id: number;
    is_mastered: boolean;
    interval: number;
    ease_factor: number;
    repetitions: number;
    next_review: string;
    updated_at: string;
    vocabulary?: Vocabulary;
}

export type VocabularyItem = Vocabulary;

// User denilince Profile özelliklerini de anlasın
import { User as SupabaseUser } from '@supabase/supabase-js';
export type ExtendedUser = SupabaseUser & Partial<Profile>;