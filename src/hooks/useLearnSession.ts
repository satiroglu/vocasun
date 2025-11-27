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

    // 1. Tüm kelime ID'lerini çek (Rastgelelik için)
    const { data: allIds } = await supabase
        .from('vocabulary')
        .select('id');

    if (!allIds || allIds.length === 0) {
        return { words: [], progressMap: {} };
    }

    // 2. Rastgele ID'ler seç
    // Not: Bu yöntem küçük/orta ölçekli veritabanları için uygundur. 
    // Çok büyük verilerde RPC (stored procedure) kullanmak daha verimlidir.
    const shuffledIds = allIds.map(item => item.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, limit);

    // 3. Seçilen ID'lerin detaylarını çek
    const { data: words } = await supabase
        .from('vocabulary')
        .select('*')
        .in('id', shuffledIds);

    const shuffledWords = (words as VocabularyItem[]).sort(() => Math.random() - 0.5);

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
            currentProgress,
            isMasteredManually = false // YENİ: "Biliyorum" butonu için
        }: {
            userId: string;
            vocabId: number;
            isCorrect: boolean;
            currentProgress: { interval: number; ease_factor: number; repetitions: number };
            isMasteredManually?: boolean;
        }) => {
            let newInterval = currentProgress.interval;
            let newEaseFactor = currentProgress.ease_factor;
            let newRepetitions = currentProgress.repetitions;
            let isMastered = false;

            if (isMasteredManually) {
                // "Biliyorum" butonu mantığı
                isMastered = true;
                newInterval = 100; // Uzun süre sorma
                newEaseFactor = 3.0; // Sabit ease factor
            } else if (isCorrect) {
                // Doğru cevap mantığı (SM-2 benzeri)
                if (newRepetitions === 0) newInterval = 1;
                else if (newRepetitions === 1) newInterval = 6;
                else newInterval = Math.round(newInterval * newEaseFactor);

                newRepetitions += 1;
                newEaseFactor = newEaseFactor + 0.1;
            } else {
                // Yanlış cevap mantığı
                newRepetitions = 0;
                newInterval = 1;
                newEaseFactor = Math.max(1.3, newEaseFactor - 0.2);
            }

            const nextReviewDate = new Date();
            nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

            // Veritabanına Kaydet
            await supabase
                .from('user_progress')
                .upsert({
                    user_id: userId,
                    vocab_id: vocabId,
                    is_mastered: isMastered,
                    updated_at: new Date().toISOString(),
                    next_review: nextReviewDate.toISOString(),
                    interval: newInterval,
                    ease_factor: newEaseFactor,
                    repetitions: newRepetitions
                }, { onConflict: 'user_id, vocab_id' });

            // XP Artırma (Hem doğru cevapta hem de "Biliyorum" dendiğinde puan verilsin mi? 
            // İstek: "Kullanıcıya puan kazandır")
            if (isCorrect || isMasteredManually) {
                await supabase.rpc('increment_score', { row_id: userId });
            }
        },
        onSuccess: () => {
            // Dashboard verilerini yenile
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            queryClient.invalidateQueries({ queryKey: ['history'] });
            queryClient.invalidateQueries({ queryKey: ['profile'] });
        },
    });
}
