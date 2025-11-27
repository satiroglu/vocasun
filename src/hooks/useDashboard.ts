'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { Profile } from '@/types';

interface RecentWord {
    updated_at: string;
    is_mastered: boolean;
    vocabulary: {
        word: string;
        meaning: string;
        audio_url?: string;
        example_en: string;
        example_tr: string;
    }
}

interface DashboardData {
    profile: Profile | null;
    recentWords: RecentWord[];
    learnedCount: number;
    dailyProgress: number;
}

// Tüm dashboard verilerini tek seferde çeken optimize edilmiş fonksiyon
async function fetchDashboardData(userId: string): Promise<DashboardData> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Tüm istekleri paralel olarak çalıştır
    const [profileRes, statsRes, recentRes, dailyRes] = await Promise.all([
        // 1. Profil
        supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single(),

        // 2. Öğrenilen Kelime Sayısı
        supabase
            .from('user_progress')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('is_mastered', true),

        // 3. Son Çalışılanlar
        supabase
            .from('user_progress')
            .select(`
                updated_at,
                is_mastered,
                vocabulary ( word, meaning, audio_url, example_en, example_tr )
            `)
            .eq('user_id', userId)
            .order('updated_at', { ascending: false })
            .limit(6),

        // 4. Günlük İlerleme
        supabase
            .from('user_progress')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .gte('updated_at', today.toISOString())
    ]);

    return {
        profile: profileRes.data as Profile,
        recentWords: (recentRes.data as any) || [],
        learnedCount: statsRes.count || 0,
        dailyProgress: dailyRes.count || 0,
    };
}

// Dashboard hook - tüm verileri cache'ler
export function useDashboard(userId: string | undefined) {
    return useQuery({
        queryKey: ['dashboard', userId],
        queryFn: () => fetchDashboardData(userId!),
        enabled: !!userId,
        staleTime: 30 * 1000, // 30 saniye - dashboard verisi sık güncellenir
    });
}

