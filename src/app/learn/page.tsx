'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { ArrowLeft, Volume2, Check, X, BookOpen, PenTool, LayoutGrid, Brain, Clock, Sparkles } from 'lucide-react';

type Mode = 'write' | 'choice' | 'flip';

// --- TypeScript Tip Tanımlaması ---
interface VocabularyItem {
    id: number;
    word: string;
    meaning: string;
    type: string;
    level: string;
    example_en: string;
    audio_url?: string;
}

export default function Learn() {
    const [loading, setLoading] = useState(true);
    const [mode, setMode] = useState<Mode>('write');

    // State'leri Tipleme
    const [words, setWords] = useState<VocabularyItem[]>([]);
    const [correctWord, setCorrectWord] = useState<VocabularyItem | null>(null);
    const [currentProgress, setCurrentProgress] = useState<any>(null);

    const [userInput, setUserInput] = useState('');
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [flipped, setFlipped] = useState(false);
    const [isFinished, setIsFinished] = useState(false);

    // --- 1. AKILLI SORU ÇEKME (SRS) ---
    const fetchQuestion = async () => {
        setLoading(true);
        setStatus('idle');
        setUserInput('');
        setFlipped(false);
        setWords([]);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // A. Akıllı Fonksiyonu Çağır (RPC)
        const { data: targetData, error } = await supabase
            .rpc('get_study_word', { user_id_input: user.id })
            .single();

        if (error || !targetData) {
            // Eğer kelime dönmediyse, günlük çalışma bitmiştir.
            if (!targetData) setIsFinished(true);
            setLoading(false);
            return;
        }

        // --- DÜZELTME BURADA: 'as VocabularyItem' kullanıyoruz ---
        const targetWord = targetData as VocabularyItem;

        setCorrectWord(targetWord);
        setIsFinished(false);

        // B. Bu kelimenin mevcut progress durumunu çek
        const { data: progressData } = await supabase
            .from('user_progress')
            .select('*')
            .eq('user_id', user.id)
            .eq('vocab_id', targetWord.id)
            .single();

        setCurrentProgress(progressData || { interval: 0, ease_factor: 2.5, repetitions: 0 });

        // C. Yanlış şıklar (distractor) çek
        const { data: randomWords } = await supabase
            .from('vocabulary')
            .select('*')
            .neq('id', targetWord.id)
            .limit(3);

        if (randomWords) {
            // Gelen veriyi tipleyerek karıştır
            const typedRandomWords = randomWords as VocabularyItem[];
            const allOptions = [targetWord, ...typedRandomWords].sort(() => Math.random() - 0.5);
            setWords(allOptions);
        }

        setLoading(false);
    };

    useEffect(() => { fetchQuestion(); }, []);

    const playAudio = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (!correctWord) return;
        if (correctWord.audio_url) new Audio(correctWord.audio_url).play().catch(() => { });
        else {
            const u = new SpeechSynthesisUtterance(correctWord.word);
            u.lang = 'en-US';
            window.speechSynthesis.speak(u);
        }
    };

    // --- 2. SRS ALGORİTMASI HESAPLAMA ---
    const calculateSRS = (isCorrect: boolean) => {
        let interval = currentProgress.interval || 0;
        let easeFactor = currentProgress.ease_factor || 2.5;

        if (isCorrect) {
            // DOĞRU CEVAP
            if (interval === 0) {
                interval = 1;
            } else if (interval === 1) {
                interval = 3;
            } else {
                interval = Math.round(interval * easeFactor);
            }
            easeFactor = easeFactor + 0.1;
        } else {
            // YANLIŞ CEVAP
            interval = 0;
            easeFactor = Math.max(1.3, easeFactor - 0.2);
        }

        const nextReviewDate = new Date();
        if (interval === 0) {
            nextReviewDate.setMinutes(nextReviewDate.getMinutes() + 1);
        } else {
            nextReviewDate.setDate(nextReviewDate.getDate() + interval);
        }

        return { interval, easeFactor, nextReviewDate };
    };

    // --- 3. İLERLEME KAYDETME ---
    const saveProgress = async (isCorrect: boolean) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !correctWord) return;

        const { interval, easeFactor, nextReviewDate } = calculateSRS(isCorrect);

        const { error } = await supabase
            .from('user_progress')
            .upsert({
                user_id: user.id,
                vocab_id: correctWord.id,
                is_mastered: interval > 20,
                updated_at: new Date().toISOString(),
                next_review: nextReviewDate.toISOString(),
                interval: interval,
                ease_factor: easeFactor
            }, { onConflict: 'user_id, vocab_id' });

        if (error) console.error("SRS Kayıt Hatası:", error);
    };

    const handleCorrect = async () => {
        setStatus('success');
        playAudio();

        // Puan ver ve Seviye Hesapla (SQL fonksiyonu halleder)
        const { data: { user } } = await supabase.auth.getUser();
        if (user) await supabase.rpc('increment_score', { row_id: user.id });

        await saveProgress(true);
    };

    const handleWrong = async () => {
        setStatus('error');
        await saveProgress(false);
    };

    // Kontrol Fonksiyonları
    const checkWriting = (e: React.FormEvent) => {
        e.preventDefault();
        if (!correctWord) return;
        if (userInput.trim().toLowerCase() === correctWord.word.trim().toLowerCase()) handleCorrect();
        else handleWrong();
    };

    const checkChoice = (selectedWord: string) => {
        if (status !== 'idle' || !correctWord) return;
        if (selectedWord === correctWord.word) handleCorrect();
        else handleWrong();
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-indigo-600 font-bold animate-pulse">Kelime Getiriliyor...</div>;

    if (isFinished) return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 text-center">
            <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 max-w-md">
                <Brain className="w-20 h-20 text-indigo-500 mx-auto mb-6" />
                <h2 className="text-3xl font-bold text-slate-800 mb-4">Harikasın! 🎉</h2>
                <p className="text-slate-600 mb-8 text-lg">
                    Bugün tekrar etmen gereken tüm kelimeleri bitirdin.
                    Yarın yeni tekrarlarla görüşürüz!
                </p>
                <Link href="/dashboard" className="block w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition">
                    Dashboard'a Dön
                </Link>
            </div>
        </div>
    );

    if (!correctWord) return null;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center p-4 font-sans">
            <div className="w-full max-w-lg flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
                <div className="flex items-center w-full sm:w-auto">
                    <Link href="/dashboard" className="p-2 text-slate-500 hover:bg-slate-200 rounded-full"><ArrowLeft size={24} /></Link>
                </div>
                <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200 w-full sm:w-auto">
                    <button onClick={() => setMode('write')} className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition text-sm font-bold ${mode === 'write' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500'}`}><PenTool size={16} /> Yaz</button>
                    <button onClick={() => setMode('choice')} className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition text-sm font-bold ${mode === 'choice' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500'}`}><LayoutGrid size={16} /> Seç</button>
                    <button onClick={() => setMode('flip')} className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition text-sm font-bold ${mode === 'flip' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500'}`}><BookOpen size={16} /> Kart</button>
                </div>
            </div>

            <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden min-h-[500px] flex flex-col relative">

                {/* Kart Başlığı */}
                <div className="bg-slate-50 p-3 flex items-center justify-between border-b border-slate-100">
                    <div className="flex flex-wrap gap-2"> {/* Mobilde taşmaması için flex-wrap ekledim */}

                        {/* 1. SRS Durumu (Tekrar mı Yeni mi?) */}
                        {currentProgress?.interval > 0 ? (
                            <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1">
                                <Clock size={12} /> Tekrar ({currentProgress.interval}g)
                            </span>
                        ) : (
                            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1">
                                <Sparkles size={12} /> Yeni
                            </span>
                        )}

                        {/* 2. EKSİK OLAN SEVİYE ETİKETİ (A1, B2 vb.) */}
                        <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded-md uppercase border border-amber-200">
                            {correctWord.level}
                        </span>

                        {/* 3. Kelime Türü (Verb, Noun vb.) */}
                        <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded-md uppercase border border-slate-200">
                            {correctWord.type}
                        </span>
                    </div>

                    {/* Ses Butonu */}
                    <button
                        onClick={playAudio}
                        className="p-2 bg-white border border-slate-200 rounded-full text-indigo-600 hover:bg-indigo-50 shadow-sm transition"
                        title="Telaffuzu Dinle"
                    >
                        <Volume2 size={20} />
                    </button>
                </div>

                <div className="flex-grow flex flex-col items-center justify-center p-6 text-center w-full">

                    {mode === 'write' && (
                        <>
                            <h2 className="text-3xl font-extrabold text-slate-800 mb-2">{correctWord.meaning}</h2>
                            <p className="text-slate-400 text-sm mb-6">İngilizcesi nedir?</p>
                            <form onSubmit={checkWriting} className="w-full relative">
                                <input value={userInput} onChange={(e) => setUserInput(e.target.value)} disabled={status === 'success'} className={`w-full text-center text-xl font-bold p-4 rounded-2xl border-2 outline-none transition ${status === 'success' ? 'border-green-500 bg-green-50' : status === 'error' ? 'border-red-500 bg-red-50' : 'border-slate-200 focus:border-indigo-500'}`} placeholder="..." autoComplete='off' />
                                {status === 'idle' && <button type="submit" className="mt-4 w-full bg-slate-900 text-white py-3 rounded-xl font-bold">Kontrol Et</button>}
                            </form>
                        </>
                    )}

                    {mode === 'choice' && (
                        <>
                            <h2 className="text-3xl font-extrabold text-slate-800 mb-8">{correctWord.meaning}</h2>
                            <div className="grid grid-cols-2 gap-3 w-full">
                                {words.map((item) => (
                                    <button key={item.id} onClick={() => checkChoice(item.word)} disabled={status !== 'idle'}
                                        className={`p-4 rounded-xl font-bold border-2 transition text-lg 
                                        ${status === 'success' && item.word === correctWord.word ? 'bg-green-500 text-white border-green-500' : ''}
                                        ${status === 'error' && item.word === correctWord.word ? 'bg-green-500 text-white border-green-500' : ''} 
                                        ${status === 'error' && item.word !== correctWord.word ? 'opacity-50' : ''}
                                        ${status === 'idle' ? 'bg-white border-slate-100 hover:border-indigo-500 text-slate-700' : ''}`}>
                                        {item.word}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}

                    {mode === 'flip' && (
                        <div className="w-full h-64 perspective cursor-pointer" onClick={() => setFlipped(!flipped)}>
                            <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${flipped ? 'rotate-y-180' : ''}`}>
                                <div className="absolute w-full h-full bg-indigo-50 rounded-2xl flex flex-col items-center justify-center backface-hidden border-2 border-indigo-100 shadow-inner">
                                    <div className="text-3xl font-bold text-indigo-900 mb-2">{correctWord.word}</div>
                                    <div className="text-sm text-indigo-400">(Çevir)</div>
                                </div>
                                <div className="absolute w-full h-full bg-white rounded-2xl flex flex-col items-center justify-center backface-hidden rotate-y-180 border-2 border-slate-200">
                                    <div className="text-2xl font-bold text-slate-800 mb-2">{correctWord.meaning}</div>
                                    <div className="text-sm text-slate-500 italic px-4 mb-4">"{correctWord.example_en}"</div>
                                    {!status && (
                                        <div className="flex gap-2 w-full px-4">
                                            <button onClick={(e) => { e.stopPropagation(); handleCorrect(); }} className="flex-1 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-bold hover:bg-green-200">Biliyorum</button>
                                            <button onClick={(e) => { e.stopPropagation(); handleWrong(); }} className="flex-1 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-bold hover:bg-red-200">Bilmiyorum</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="mt-6 w-full animate-fade-in-up">
                            <div className="bg-green-100 text-green-800 p-3 rounded-xl mb-3 flex items-center justify-center gap-2">
                                <Check size={20} />
                                <div>
                                    <b>Doğru!</b>
                                    <span className="text-xs ml-2 opacity-75">
                                        (Sonraki tekrar: {calculateSRS(true).interval} gün sonra)
                                    </span>
                                </div>
                            </div>
                            <button onClick={fetchQuestion} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition">Devam Et</button>
                        </div>
                    )}

                    {status === 'error' && mode !== 'flip' && (
                        <div className="mt-6 w-full animate-fade-in-up">
                            <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-3 text-center">
                                Doğrusu: <b>{correctWord.word}</b>
                                <div className="text-xs mt-1 opacity-75">Bu kelimeyi yakında tekrar soracağım.</div>
                            </div>
                            <button onClick={fetchQuestion} className="w-full bg-slate-200 text-slate-700 py-3 rounded-xl font-bold">Anladım</button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}