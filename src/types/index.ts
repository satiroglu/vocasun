// Veritabanı tiplerimiz. Gelecekte tablo yapısı değişirse sadece burayı güncelleyeceğiz.
export interface Profile {
    id: string;
    username: string | null;
    first_name: string | null;
    last_name: string | null;
    email: string;
    total_xp: number;
    level: number;
    display_name_preference: 'username' | 'fullname';
    created_at: string;
}

export interface Vocabulary {
    id: number;
    word: string;
    meaning: string;
    type: string; // 'verb', 'noun', 'idiom' vb.
    level: string; // 'A1', 'B2' vb.
    example_en: string;
    example_tr: string;
    audio_url?: string;
}

export interface UserProgress {
    id: number;
    user_id: string;
    vocab_id: number;
    is_mastered: boolean;
    interval: number;
    ease_factor: number;
    next_review: string; // ISO Date string
    updated_at: string;
    vocabulary?: Vocabulary; // Join ile gelen veri
}

export type VocabularyItem = Vocabulary;