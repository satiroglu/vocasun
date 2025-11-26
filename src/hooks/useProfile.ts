'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { Profile } from '@/types';

// Profil verisini çeken yardımcı fonksiyon
async function fetchProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

    if (error) {
        console.error('Profil çekme hatası:', error.message);
        return null;
    }

    return data as Profile;
}

// React Query hook - tüm sayfalarda kullanılabilir
export function useProfile(userId: string | undefined) {
    return useQuery({
        queryKey: ['profile', userId],
        queryFn: () => fetchProfile(userId!),
        enabled: !!userId, // userId varsa sorguyu çalıştır
        staleTime: 5 * 60 * 1000, // 5 dakika - profil verisi pek değişmez
    });
}

