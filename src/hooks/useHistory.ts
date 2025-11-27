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
        level: string;
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
    types?: string[];
    levels?: string[];
}

interface HistoryData {
    items: HistoryItem[];
    totalCount: number;
}

// Geçmiş verilerini çeken fonksiyon
async function fetchHistory({ userId, page, itemsPerPage, filter, types, levels }: HistoryParams): Promise<HistoryData> {
    let query = supabase
        .from('user_progress')
        .select(`
            updated_at,
            is_mastered,
            vocabulary!inner ( word, meaning, audio_url, type, level, example_en, example_tr )
        `, { count: 'exact' })
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

    if (filter === 'mastered') query = query.eq('is_mastered', true);
    if (filter === 'learning') query = query.eq('is_mastered', false);

    if (types && types.length > 0) {
        query = query.in('vocabulary.type', types);
    }

    if (levels && levels.length > 0) {
        query = query.in('vocabulary.level', levels);
    }

    const from = (page - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;

    const { data, count } = await query.range(from, to);

    return {
        items: (data as any) || [],
        totalCount: count || 0,
    };
}

// History hook
export function useHistory(userId: string | undefined, page: number, filter: 'all' | 'mastered' | 'learning', itemsPerPage = 10, types?: string[], levels?: string[]) {
    return useQuery({
        queryKey: ['history', userId, page, filter, types, levels],
        queryFn: () => fetchHistory({ userId: userId!, page, itemsPerPage, filter, types, levels }),
        enabled: !!userId,
        staleTime: 60 * 1000, // 1 dakika
    });
}

