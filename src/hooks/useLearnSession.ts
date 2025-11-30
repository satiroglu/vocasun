'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { VocabularyItem } from '@/types';

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

// Öğrenme oturumu verilerini çeken optimize edilmiş fonksiyon
async function fetchLearnSession(userId: string): Promise<SessionData> {
    // 0. Kullanıcının günlük hedefini çek
    const { data: profile } = await supabase
        .from('profiles')
        .select('daily_goal')
        .eq('id', userId)
        .single();

    const limit = profile?.daily_goal || 10;

    // 1. Akıllı öğrenme oturumu (Review + New Words)
    const { data: words, error } = await supabase
        .rpc('get_learning_session', { p_user_id: userId, p_limit: limit });

    if (error) {
        console.error('Error fetching random words:', error);
        return { words: [], progressMap: {} };
    }

    const shuffledWords = (words as VocabularyItem[]) || [];

    if (shuffledWords.length === 0) {
        return { words: [], progressMap: {} };
    }

    // 2. Bu kelimelerin ilerleme durumlarını çek
    const wordIds = shuffledWords.map(w => w.id);
    const { data: progressData } = await supabase
        .from('user_progress')
        .select('vocab_id, interval, ease_factor, repetitions')
        .eq('user_id', userId)
        .in('vocab_id', wordIds);

    // Progress Map oluştur
    const pMap: ProgressMap = {};

    // Önce tüm kelimeler için varsayılan "Yeni" kaydı oluştur
    shuffledWords.forEach(w => {
        pMap[w.id] = {
            interval: 0,
            ease_factor: 2.5,
            repetitions: 0,
            is_new: true
        };
    });

    // Varsa veritabanından gelen verilerle güncelle
    progressData?.forEach((p: any) => {
        pMap[p.vocab_id] = {
            interval: p.interval,
            ease_factor: p.ease_factor,
            repetitions: p.repetitions,
            is_new: false // Veritabanında varsa yeni değildir
        };
    });

    return { words: shuffledWords, progressMap: pMap };
}

// Şıkları çeken fonksiyon (Seçme modu için)
async function fetchChoiceOptions(excludeId: number): Promise<VocabularyItem[]> {
    const { data, error } = await supabase
        .rpc('get_choice_options', { exclude_id: excludeId, limit_count: 3 });

    if (error) {
        console.error('Error fetching choice options:', error);
        return [];
    }

    return (data as VocabularyItem[]) || [];
}

// Learn session hook
export function useLearnSession(userId: string | undefined) {
    return useQuery({
        queryKey: ['learn-session', userId],
        queryFn: () => fetchLearnSession(userId!),
        enabled: !!userId,
        staleTime: 0,
        gcTime: 0,
    });
}

// Şıkları çeken hook (Seçme modu için)
export function useChoiceOptions(wordId: number | undefined) {
    return useQuery({
        queryKey: ['choice-options', wordId],
        queryFn: () => fetchChoiceOptions(wordId!),
        enabled: !!wordId,
        staleTime: 60 * 1000,
    });
}

// İlerleme kaydetme mutation
export function useSaveProgress() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            userId,
            vocabId,
            userAnswer, // ARTIK CEVABI GÖNDERİYORUZ
            isMastered = false,
            mode = 'flip'
        }: {
            userId: string;
            vocabId: number;
            userAnswer?: string | null; // String veya null olabilir
            isMastered?: boolean;
            mode?: 'write' | 'choice' | 'flip';
        }) => {
            // Veritabanına Kaydet (RPC parametreleri güncellendi)
            const { data, error: rpcError } = await supabase.rpc('save_user_progress', {
                p_user_id: userId,
                p_vocab_id: vocabId,
                p_user_answer: userAnswer, // Yeni parametre
                p_is_mastered: isMastered,
                p_mode: mode
            });

            if (rpcError) {
                console.error('Error saving progress (RPC):', rpcError);
                throw new Error(rpcError.message);
            }

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
