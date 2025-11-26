export interface Profile {
    id: string;
    username: string | null;
    first_name: string | null;
    last_name: string | null;
    email: string;
    total_xp: number;
    level: number;
    daily_goal: number;
    bio?: string;
    avatar_url?: string;
    display_name_preference: 'username' | 'fullname';
    leaderboard_visibility?: 'visible' | 'anonymous' | 'hidden'; // YENİ: Liderlik tablosu gizliliği
    preferred_word_list?: 'general' | 'academic' | 'business' | 'toefl' | 'ielts'; // YENİ: Tercih edilen kelime listesi
    difficulty_level?: 'beginner' | 'intermediate' | 'advanced' | 'mixed'; // YENİ: Zorluk seviyesi
    created_at: string;
    marked_for_deletion_at?: string | null;
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
    image_url?: string; // YENİ: Görsel desteği
}

export interface UserProgress {
    id: number;
    user_id: string;
    vocab_id: number;
    is_mastered: boolean;
    interval: number;
    ease_factor: number;
    next_review: string;
    updated_at: string;
    vocabulary?: Vocabulary;
}

export type VocabularyItem = Vocabulary;