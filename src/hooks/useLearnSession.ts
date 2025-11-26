'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { VocabularyItem } from '@/types';

interface ProgressMap {
    [key: number]: {
        interval: number;
        ease_factor: number;
        repetitions: number;
    }
}

interface SessionData {
    words: VocabularyItem[];
    progressMap: ProgressMap;
}

// Öğrenme oturumu verilerini çeken optimize edilmiş fonksiyon
async function fetchLearnSession(userId: string): Promise<SessionData> {
    // 1. Kelimeleri çek (rastgele 10 kelime)
    const { data: words } = await supabase
        .from('vocabulary')
        .select('*')
        .limit(10);

    if (!words || words.length === 0) {
        return { words: [], progressMap: {} };
    }

    const shuffledWords = (words as VocabularyItem[]).sort(() => Math.random() - 0.5);

    // 2. Bu kelimelerin ilerleme durumlarını çek
    const wordIds = shuffledWords.map(w => w.id);
    const { data: progressData } = await supabase
        .from('user_progress')
        .select('vocab_id, interval, ease_factor')
        .eq('user_id', userId)
        .in('vocab_id', wordIds);

    // Progress Map oluştur
    const pMap: ProgressMap = {};
    progressData?.forEach((p: any) => {
        pMap[p.vocab_id] = {
            interval: p.interval,
            ease_factor: p.ease_factor,
            repetitions: 0
        };
    });

    return { words: shuffledWords, progressMap: pMap };
}

// Şıkları çeken fonksiyon (Seçme modu için)
async function fetchChoiceOptions(excludeId: number): Promise<VocabularyItem[]> {
    const { data } = await supabase
        .from('vocabulary')
        .select('*')
        .neq('id', excludeId)
        .limit(3);

    return (data as VocabularyItem[]) || [];
}

// Learn session hook
export function useLearnSession(userId: string | undefined) {
    return useQuery({
        queryKey: ['learn-session', userId],
        queryFn: () => fetchLearnSession(userId!),
        enabled: !!userId,
        staleTime: 0, // Her seferinde yeni oturum
        gcTime: 0, // Cache'de tutma (yeni session istenince eski silinsin)
    });
}

// Şıkları çeken hook (Seçme modu için)
export function useChoiceOptions(wordId: number | undefined) {
    return useQuery({
        queryKey: ['choice-options', wordId],
        queryFn: () => fetchChoiceOptions(wordId!),
        enabled: !!wordId,
        staleTime: 60 * 1000, // 1 dakika - aynı kelime için tekrar çekmesin
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
            currentProgress 
        }: { 
            userId: string; 
            vocabId: number; 
            isCorrect: boolean; 
            currentProgress: { interval: number; ease_factor: number; repetitions: number } 
        }) => {
            let newInterval = currentProgress.interval;
            let newEaseFactor = currentProgress.ease_factor;

            // Basit SRS Mantığı
            if (isCorrect) {
                if (newInterval === 0) newInterval = 1;
                else if (newInterval === 1) newInterval = 3;
                else newInterval = Math.round(newInterval * newEaseFactor);
                newEaseFactor = newEaseFactor + 0.1;
            } else {
                newInterval = 0;
                newEaseFactor = Math.max(1.3, newEaseFactor - 0.2);
            }

            const nextReviewDate = new Date();
            if (newInterval === 0) nextReviewDate.setMinutes(nextReviewDate.getMinutes() + 1);
            else nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

            // Veritabanına Kaydet
            await supabase
                .from('user_progress')
                .upsert({
                    user_id: userId,
                    vocab_id: vocabId,
                    is_mastered: newInterval > 20,
                    updated_at: new Date().toISOString(),
                    next_review: nextReviewDate.toISOString(),
                    interval: newInterval,
                    ease_factor: newEaseFactor
                }, { onConflict: 'user_id, vocab_id' });

            // XP Artırma
            if (isCorrect) {
                await supabase.rpc('increment_score', { row_id: userId });
            }
        },
        onSuccess: () => {
            // Dashboard verilerini yenile (ilerleme değiştiği için)
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            queryClient.invalidateQueries({ queryKey: ['history'] });
            queryClient.invalidateQueries({ queryKey: ['profile'] });
        },
    });
}

