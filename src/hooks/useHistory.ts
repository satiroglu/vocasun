'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';

interface HistoryItem {
    updated_at: string;
    is_mastered: boolean;
    next_review: string;
    vocabulary: {
        word: string;
        meaning: string;
        type: string;
        audio_url?: string;
        example_en: string;
        example_tr: string;
    }
}

interface HistoryParams {
    userId: string;
    page: number;
    itemsPerPage: number;
    filter: 'all' | 'mastered' | 'learning';
}

interface HistoryData {
    items: HistoryItem[];
    totalCount: number;
}

// Geçmiş verilerini çeken fonksiyon
async function fetchHistory({ userId, page, itemsPerPage, filter }: HistoryParams): Promise<HistoryData> {
    let query = supabase
        .from('user_progress')
        .select(`
            updated_at,
            is_mastered,
            vocabulary ( word, meaning, audio_url, type, example_en, example_tr )
        `, { count: 'exact' })
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

    if (filter === 'mastered') query = query.eq('is_mastered', true);
    if (filter === 'learning') query = query.eq('is_mastered', false);

    const from = (page - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;

    const { data, count } = await query.range(from, to);

    return {
        items: (data as any) || [],
        totalCount: count || 0,
    };
}

// History hook
export function useHistory(userId: string | undefined, page: number, filter: 'all' | 'mastered' | 'learning', itemsPerPage = 10) {
    return useQuery({
        queryKey: ['history', userId, page, filter],
        queryFn: () => fetchHistory({ userId: userId!, page, itemsPerPage, filter }),
        enabled: !!userId,
        staleTime: 60 * 1000, // 1 dakika
    });
}

