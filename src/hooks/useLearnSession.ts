'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { VocabularyItem } from '@/types';

interface ProgressMap {
    [key: number]: {
        interval: number;
        ease_factor: number;
        repetitions: number;
        is_new: boolean; // YENİ: Durum etiketi için
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
        staleTime: 0, // Her seferinde yeni oturum
        gcTime: 0, // Cache'de tutma
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
            isCorrect,
            isMasteredManually = false,
            mode = 'choice' // <--- YENİ: Varsayılan 'choice'
        }: {
            userId: string;
            vocabId: number;
            isCorrect: boolean;
            isMasteredManually?: boolean;
            mode?: string; // <--- YENİ: 'mode' parametresi
        }) => {
            // Veritabanına Kaydet (RPC ile - SRS mantığı artık SQL tarafında)
            const { data, error: rpcError } = await supabase.rpc('save_user_progress', {
                p_user_id: userId,
                p_vocab_id: vocabId,
                p_is_correct: isCorrect,
                p_is_mastered: isMasteredManually,
                p_mode: mode// <--- YENİ: Mod bilgisini gönderiyoruz
            });

            if (rpcError) {
                console.error('Error saving progress (RPC):', rpcError);
                throw new Error(rpcError.message);
            }

            return data; // Backend'den dönen puan/level bilgisini dönebiliriz

            // XP Artırma
            // if (isCorrect || isMasteredManually) {
            //     await supabase.rpc('increment_score', { row_id: userId });
            // }
        },
        onSuccess: () => {
            // Eğer seviye atladıysa burada data.level_up kontrolü yapabilirsin
            // Dashboard, History ve Profil verilerini yenile
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            queryClient.invalidateQueries({ queryKey: ['history'] });
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
        },
    });
}
