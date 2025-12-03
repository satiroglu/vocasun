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
    preferred_word_list?: 'general' | 'academic' | 'business' | 'toefl' | 'ielts';
    difficulty_level?: 'beginner' | 'intermediate' | 'advanced' | 'mixed';
    created_at: string;
    marked_for_deletion_at?: string | null;
    is_admin?: boolean;
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