'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { Profile } from '@/types';

// Lider tablosunu çeken fonksiyon
async function fetchLeaderboard(): Promise<Partial<Profile>[]> {
    const { data } = await supabase
        .from('profiles')
        .select('username, first_name, last_name, total_xp, level, display_name_preference, leaderboard_visibility')
        .neq('leaderboard_visibility', 'hidden') // Gizli olanları getirme
        .order('total_xp', { ascending: false })
        .limit(20);

    return (data as Partial<Profile>[]) || [];
}

// Leaderboard hook
export function useLeaderboard() {
    return useQuery({
        queryKey: ['leaderboard'],
        queryFn: fetchLeaderboard,
        staleTime: 0, // Her zaman güncel veri çek
    });
}

