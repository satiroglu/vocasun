'use client';

import { useQuery } from '@tanstack/react-query';
import { Profile } from '@/types';

// Parametreye göre sıralama yapan fonksiyon
async function fetchLeaderboard(timeframe: 'all-time' | 'weekly'): Promise<Partial<Profile>[]> {
    const response = await fetch(`/api/leaderboard?timeframe=${timeframe}`);
    if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
    }
    return response.json();
}

// Leaderboard hook artık parametre alıyor
export function useLeaderboard(timeframe: 'all-time' | 'weekly' = 'weekly') {
    return useQuery({
        queryKey: ['leaderboard', timeframe], // Cache key değişince veri yenilenir
        queryFn: () => fetchLeaderboard(timeframe),
        staleTime: 60 * 1000, // 1 dakika cache
    });
}