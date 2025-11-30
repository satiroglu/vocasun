'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { VocabularyItem } from '@/types';

export function useDailyWords() {
    const [words, setWords] = useState<VocabularyItem[]>([]);
    const [loading, setLoading] = useState(true);

    // Günlük rastgelelik tohumu (Seed)
    const getDailySeed = () => {
        const today = new Date();
        return today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    };

    const seededRandom = (seed: number) => {
        const x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    };

    useEffect(() => {
        const fetchDailyWords = async () => {
            setLoading(true);
            try {
                // 1. Toplam kelime sayısını al
                const { count, error: countError } = await supabase
                    .from('vocabulary')
                    .select('*', { count: 'exact', head: true });

                if (countError) throw countError;

                const total = count || 0;
                if (total === 0) {
                    setLoading(false);
                    return;
                }

                // 2. Günlük tohum ile 5 rastgele offset üret
                const seed = getDailySeed();
                const uniqueOffsets = new Set<number>();
                let attempt = 0;

                while (uniqueOffsets.size < 5 && attempt < 20) {
                    const randomVal = seededRandom(seed + attempt);
                    const offset = Math.floor(randomVal * total);
                    uniqueOffsets.add(offset);
                    attempt++;
                }

                // 3. Kelimeleri çek
                const promises = Array.from(uniqueOffsets).map(offset =>
                    supabase.from('vocabulary').select('*').range(offset, offset).limit(1).single()
                );

                const results = await Promise.all(promises);
                const fetchedWords = results
                    .map(r => r.data)
                    .filter((w): w is VocabularyItem => !!w);

                setWords(fetchedWords);
            } catch (err) {
                console.error('Error fetching daily words:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchDailyWords();
    }, []);

    return { words, loading };
}