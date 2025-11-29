'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { Profile } from '@/types';

// Parametreye göre sıralama yapan fonksiyon
async function fetchLeaderboard(timeframe: 'all-time' | 'weekly'): Promise<Partial<Profile>[]> {
    // Hangi sütuna göre sıralayacağımızı seçiyoruz
    const sortColumn = timeframe === 'weekly' ? 'weekly_xp' : 'total_xp';

    const { data } = await supabase
        .from('profiles')
        .select('username, first_name, last_name, total_xp, weekly_xp, level, display_name_preference, leaderboard_visibility')
        .neq('leaderboard_visibility', 'hidden') // Gizli olanları getirme
        .order(sortColumn, { ascending: false }) // Dinamik sıralama
        .limit(50); // Rekabeti artırmak için limiti 50 yaptık

    return (data as Partial<Profile>[]) || [];
}

// Leaderboard hook artık parametre alıyor
export function useLeaderboard(timeframe: 'all-time' | 'weekly' = 'weekly') {
    return useQuery({
        queryKey: ['leaderboard', timeframe], // Cache key değişince veri yenilenir
        queryFn: () => fetchLeaderboard(timeframe),
        staleTime: 60 * 1000, // 1 dakika cache
    });
}