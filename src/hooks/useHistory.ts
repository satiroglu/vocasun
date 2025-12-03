'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';

interface HistoryItem {
    vocab_id: number;
    updated_at: string;
    is_mastered: boolean;
    repetitions: number;
    next_review: string;
    vocabulary: {
        id: number;
        word: string;
        meaning: string;
        type: string;
        level: string;
        audio_url?: string;
        audio_us?: string | null;
        audio_uk?: string | null;
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
    search?: string;
}

interface HistoryData {
    items: HistoryItem[];
    totalCount: number;
}

// Geçmiş verilerini çeken fonksiyon
async function fetchHistory({ userId, page, itemsPerPage, filter, types, levels, search }: HistoryParams): Promise<HistoryData> {
    let query = supabase
        .from('user_progress')
        .select(`
            vocab_id,
            updated_at,
            is_mastered,
            repetitions,
            vocabulary!inner ( id, word, meaning, audio_url, audio_us, audio_uk, type, level, example_en, example_tr )
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

    if (search) {
        query = query.or(`word.ilike.%${search}%,meaning.ilike.%${search}%`, { foreignTable: 'vocabulary' });
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
export function useHistory(userId: string | undefined, page: number, filter: 'all' | 'mastered' | 'learning', itemsPerPage = 10, types?: string[], levels?: string[], search?: string) {
    return useQuery({
        queryKey: ['history', userId, page, filter, types, levels, search],
        queryFn: () => fetchHistory({ userId: userId!, page, itemsPerPage, filter, types, levels, search }),
        enabled: !!userId,
        staleTime: 60 * 1000, // 1 dakika
    });
}

// İstatistikleri çeken hook
export function useHistoryStats(userId: string | undefined) {
    return useQuery({
        queryKey: ['history-stats', userId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('user_progress')
                .select('is_mastered', { count: 'exact' })
                .eq('user_id', userId!);

            if (error) throw error;

            const total = data?.length || 0;
            const mastered = data?.filter(i => i.is_mastered).length || 0;
            const learning = total - mastered;

            return { total, mastered, learning };
        },
        enabled: !!userId,
    });
}

// Kelimeyi tekrar öğrenme listesine alan hook
export function useRelearnWord() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ userId, vocabId }: { userId: string, vocabId: number }) => {
            const { error } = await supabase
                .from('user_progress')
                .update({
                    is_mastered: false,
                    interval: 0,
                    repetitions: 0,
                    ease_factor: 2.5,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', userId)
                .eq('vocab_id', vocabId);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['history'] });
            queryClient.invalidateQueries({ queryKey: ['history-stats'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
}

