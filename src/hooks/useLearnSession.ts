'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { VocabularyItem } from '@/types';

// Backend'den gelen zenginleştirilmiş veri tipi
interface EnrichedVocabularyItem extends VocabularyItem {
    interval: number;
    ease_factor: number;
    repetitions: number;
    status: 'new' | 'review';
}

interface ProgressMap {
    [key: number]: {
        interval: number;
        ease_factor: number;
        repetitions: number;
        is_new: boolean;
    }
}

interface SessionData {
    words: VocabularyItem[];
    progressMap: ProgressMap;
}

// ARTIK TEK SORGULUK, HIZLI VE TEMİZ FONKSİYON
async function fetchLearnSession(userId: string): Promise<SessionData> {
    // 1. Günlük hedefi al
    const { data: profile } = await supabase
        .from('profiles')
        .select('daily_goal')
        .eq('id', userId)
        .single();

    const limit = profile?.daily_goal || 10;

    // 2. Akıllı oturumu çek (Tek istek!)
    const { data, error } = await supabase
        .rpc('get_learning_session', { p_user_id: userId, p_limit: limit });

    if (error) {
        console.error('Error fetching session:', error);
        return { words: [], progressMap: {} };
    }

    // Gelen JSON verisini işle
    const items = (data as EnrichedVocabularyItem[]) || [];

    if (items.length === 0) {
        return { words: [], progressMap: {} };
    }

    // 3. Veriyi Frontend'in beklediği yapıya dönüştür
    const words: VocabularyItem[] = [];
    const pMap: ProgressMap = {};

    items.forEach(item => {
        // Kelime listesine saf kelime verisini ekle
        // (status, interval gibi alanları ayıklıyoruz)
        const { interval, ease_factor, repetitions, status, ...vocabData } = item;
        words.push(vocabData as VocabularyItem);

        // İlerleme haritasını doldur
        pMap[item.id] = {
            interval: item.interval,
            ease_factor: item.ease_factor,
            repetitions: item.repetitions,
            is_new: item.status === 'new'
        };
    });

    return { words, progressMap: pMap };
}

// Şıkları çeken fonksiyon (Değişmedi)
async function fetchChoiceOptions(excludeId: number): Promise<VocabularyItem[]> {
    const { data, error } = await supabase
        .rpc('get_choice_options', { exclude_id: excludeId, limit_count: 3 });

    if (error) {
        console.error('Error fetching choice options:', error);
        return [];
    }
    return (data as VocabularyItem[]) || [];
}

// Hook (Değişmedi)
export function useLearnSession(userId: string | undefined) {
    return useQuery({
        queryKey: ['learn-session', userId],
        queryFn: () => fetchLearnSession(userId!),
        enabled: !!userId,
        staleTime: 5 * 60 * 1000, // 5 minutes - reduce unnecessary refetches
        gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache longer
    });
}

// Şık Hook'u (Değişmedi)
export function useChoiceOptions(wordId: number | undefined) {
    return useQuery({
        queryKey: ['choice-options', wordId],
        queryFn: () => fetchChoiceOptions(wordId!),
        enabled: !!wordId,
        staleTime: 60 * 1000,
    });
}

// Progress Kaydetme (Değişmedi - Zaten güvenli hale getirmiştik)
export function useSaveProgress() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            userId,
            vocabId,
            userAnswer,
            isMastered = false,
            mode = 'flip'
        }: {
            userId: string;
            vocabId: number;
            userAnswer?: string | null;
            isMastered?: boolean;
            mode?: 'write' | 'choice' | 'flip';
        }) => {
            const { data, error: rpcError } = await supabase.rpc('save_user_progress', {
                p_user_id: userId,
                p_vocab_id: vocabId,
                p_user_answer: userAnswer,
                p_is_mastered: isMastered,
                p_mode: mode
            });

            if (rpcError) throw new Error(rpcError.message);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            queryClient.invalidateQueries({ queryKey: ['history'] });
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
        },
    });
}