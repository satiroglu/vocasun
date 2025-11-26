'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
    ArrowLeft, Volume2, Check, X, PenTool, LayoutGrid,
    BookOpen, Sparkles, SkipForward, Trophy, RotateCcw
} from 'lucide-react';
import { VocabularyItem } from '@/types';
import Button from '@/components/Button';
import { useUser } from '@/hooks/useUser';
import { useLearnSession, useChoiceOptions, useSaveProgress } from '@/hooks/useLearnSession';

type Mode = 'write' | 'choice' | 'flip';
type FeedbackStatus = 'idle' | 'success' | 'error';

interface ProgressMap {
    [key: number]: {
        interval: number;
        ease_factor: number;
        repetitions: number;
    }
}

export default function Learn() {
    // Hooks
    const { user } = useUser();
    const { data: sessionData, isLoading: sessionLoading, refetch: refetchSession } = useLearnSession(user?.id);
    const saveProgressMutation = useSaveProgress();

    // State Yönetimi
    const [mode, setMode] = useState<Mode>('write');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [sessionStats, setSessionStats] = useState({ correct: 0, wrong: 0, earnedXp: 0 });
    const [isSessionFinished, setIsSessionFinished] = useState(false);
    const [userInput, setUserInput] = useState('');
    const [status, setStatus] = useState<FeedbackStatus>('idle');
    const [flipped, setFlipped] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const [showFullResult, setShowFullResult] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const queue = sessionData?.words || [];
    const progressMap = sessionData?.progressMap || {};
    const currentWord = queue[currentIndex];

    // Şıkları çek (choice modu için)
    const { data: choiceOptions = [] } = useChoiceOptions(
        mode === 'choice' && currentWord ? currentWord.id : undefined
    );

    // Yeni oturum başlat
    const startNewSession = () => {
        setCurrentIndex(0);
        setSessionStats({ correct: 0, wrong: 0, earnedXp: 0 });
        setIsSessionFinished(false);
        refetchSession();
    };

    // Soru hazırlama
    useEffect(() => {
        setStatus('idle');
        setShowFullResult(false);
        setUserInput('');
        setFlipped(false);
        setIsProcessing(false);

        if (mode === 'write') {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [currentIndex, mode]);

    // ETKİLEŞİM HANDLERS
    const playAudio = (text?: string) => {
        const wordToPlay = text || currentWord?.word;
        if (!wordToPlay) return;

        if (currentWord?.audio_url && !text) {
            new Audio(currentWord.audio_url).play().catch(() => { });
        } else {
            const u = new SpeechSynthesisUtterance(wordToPlay);
            u.lang = 'en-US';
            window.speechSynthesis.speak(u);
        }
    };

    const handleAnswer = async (isCorrect: boolean) => {
        if (isProcessing || !user || !currentWord) return;
        setIsProcessing(true);

        setStatus(isCorrect ? 'success' : 'error');
        setShowFullResult(true);

        if (isCorrect) {
            playAudio();
            setSessionStats(prev => ({ ...prev, correct: prev.correct + 1, earnedXp: prev.earnedXp + 10 }));
        } else {
            playAudio();
            setSessionStats(prev => ({ ...prev, wrong: prev.wrong + 1 }));
        }

        // İlerlemeyi kaydet (optimize edilmiş mutation)
        const currentP = progressMap[currentWord.id] || { interval: 0, ease_factor: 2.5, repetitions: 0 };
        await saveProgressMutation.mutateAsync({
            userId: user.id,
            vocabId: currentWord.id,
            isCorrect,
            currentProgress: currentP
        });
    };

    const nextQuestion = () => {
        if (currentIndex < queue.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            setIsSessionFinished(true);
        }
    };

    // Şık listesini hazırla (choice modu için)
    const options = mode === 'choice' && currentWord
        ? [currentWord, ...choiceOptions].sort(() => Math.random() - 0.5)
        : [];

    // Klavye Kısayolları
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (status !== 'idle' && showFullResult) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    nextQuestion();
                }
                return;
            }
            if (mode === 'choice' && status === 'idle' && options.length > 0) {
                if (['1', '2', '3', '4'].includes(e.key)) {
                    const index = parseInt(e.key) - 1;
                    if (options[index]) {
                        handleAnswer(options[index].id === currentWord?.id);
                    }
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [status, showFullResult, mode, options, currentWord]);

    // RENDER: LOADING
    if (sessionLoading) return (
        <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-slate-50">
            <div className="animate-spin w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
            <p className="mt-4 text-indigo-600 font-bold animate-pulse">Oturum Hazırlanıyor...</p>
        </div>
    );

    // --- RENDER: SONUÇ EKRANI (SESSION FINISHED) ---
    if (isSessionFinished) return (
        <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 bg-slate-50 text-center font-sans">
            <div className="bg-white p-8 sm:p-12 rounded-[2rem] shadow-xl border border-slate-100 w-full max-w-md animate-scale-up">
                <div className="w-20 h-20 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-yellow-200">
                    <Trophy size={40} className="fill-yellow-600" />
                </div>
                <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Tebrikler! 🎉</h2>
                <p className="text-slate-500 mb-8 font-medium">Bu oturumu başarıyla tamamladın.</p>

                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-green-50 p-4 rounded-2xl border border-green-100">
                        <div className="text-3xl font-black text-green-600">{sessionStats.correct}</div>
                        <div className="text-xs font-bold text-green-500 uppercase tracking-wide">Doğru</div>
                    </div>
                    <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                        <div className="text-3xl font-black text-indigo-600">+{sessionStats.earnedXp}</div>
                        <div className="text-xs font-bold text-indigo-500 uppercase tracking-wide">XP Kazanıldı</div>
                    </div>
                </div>

                <div className="space-y-3">
                    <Button onClick={startNewSession} className="w-full h-14 text-lg shadow-indigo-200" icon={<RotateCcw size={20} />}>
                        Yeni Oturum Başlat
                    </Button>
                    <Link href="/dashboard" className="block">
                        <Button variant="outline" className="w-full h-14 text-lg border-2">Dashboard'a Dön</Button>
                    </Link>
                </div>
            </div>
        </div>
    );

    if (!currentWord) return null;

    // --- RENDER: AKTİF SORU EKRANI ---
    return (
        // 100dvh: Mobil tarayıcılar için tam ekran yüksekliği
        <div className="h-[100dvh] bg-slate-50 flex flex-col overflow-hidden font-sans relative">

            {/* --- HEADER: Progress & Tools --- */}
            <div className="px-4 py-3 flex items-center justify-between bg-white border-b border-slate-200 shrink-0 z-10 h-16">
                <Link href="/dashboard" className="p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition"><ArrowLeft size={24} /></Link>

                {/* Progress Bar */}
                <div className="flex-1 mx-4 max-w-xs">
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-indigo-500 transition-all duration-500 ease-out rounded-full"
                            style={{ width: `${((currentIndex) / queue.length) * 100}%` }}
                        ></div>
                    </div>
                    <div className="text-[10px] text-right text-slate-400 font-bold mt-1">
                        Soru {currentIndex + 1} / {queue.length}
                    </div>
                </div>

                {/* Mod Değiştirici */}
                <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
                    <button onClick={() => setMode('write')} className={`p-2 rounded-md transition ${mode === 'write' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}><PenTool size={18} /></button>
                    <button onClick={() => setMode('choice')} className={`p-2 rounded-md transition ${mode === 'choice' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}><LayoutGrid size={18} /></button>
                    <button onClick={() => setMode('flip')} className={`p-2 rounded-md transition ${mode === 'flip' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}><BookOpen size={18} /></button>
                </div>
            </div>

            {/* --- MAIN CONTENT AREA --- */}
            <div className="flex-1 relative flex flex-col w-full max-w-lg mx-auto overflow-y-auto">

                <div className="flex-1 flex flex-col items-center justify-center p-6 w-full min-h-full">

                    {/* Görsel Desteği (Varsa) */}
                    {currentWord.image_url && !showFullResult && mode !== 'flip' && (
                        <div className="mb-6 w-40 h-40 relative rounded-3xl overflow-hidden shadow-lg border-4 border-white ring-1 ring-slate-100">
                            <img src={currentWord.image_url} alt="Word visual" className="object-cover w-full h-full" />
                        </div>
                    )}

                    {/* Kelime Kartı (Kart Modu Hariç) */}
                    {mode !== 'flip' && (
                        <div className="text-center mb-8 w-full animate-fade-in">
                            <h2 className="text-3xl sm:text-4xl font-black text-slate-800 mb-3 break-words leading-tight">
                                {currentWord.meaning}
                            </h2>
                            {/* Seviye Badge */}
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wide mb-1">
                                <Sparkles size={12} className="fill-indigo-600" /> {currentWord.level || 'Genel'}
                            </div>
                            <p className="text-slate-400 font-medium text-sm mt-2">İngilizcesi nedir?</p>
                        </div>
                    )}

                    {/* --- MOD: YAZMA (Write) --- */}
                    {mode === 'write' && !showFullResult && (
                        <form
                            onSubmit={(e) => { e.preventDefault(); handleAnswer(userInput.trim().toLowerCase() === currentWord.word.toLowerCase()); }}
                            className="w-full animate-fade-in-up"
                        >
                            <div className="relative group">
                                <input
                                    ref={inputRef}
                                    value={userInput}
                                    onChange={(e) => setUserInput(e.target.value)}
                                    className="w-full text-center text-2xl font-bold p-5 bg-white rounded-2xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all shadow-sm text-slate-800 placeholder:text-slate-300"
                                    placeholder="Buraya yazın..."
                                    autoComplete="off"
                                    autoCorrect="off"
                                    autoCapitalize="off"
                                />
                            </div>
                            <div className="mt-6 flex flex-col-reverse sm:flex-row gap-3">
                                <button
                                    type="button"
                                    onClick={() => handleAnswer(false)}
                                    className="flex-1 py-4 bg-white border-2 border-slate-100 text-slate-500 font-bold rounded-xl hover:bg-slate-50 hover:text-slate-700 transition flex items-center justify-center gap-2"
                                >
                                    <SkipForward size={18} /> Bilmiyorum
                                </button>
                                <button
                                    type="submit"
                                    className="flex-[2] py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 active:scale-[0.98] transition hover:bg-indigo-700"
                                >
                                    Kontrol Et
                                </button>
                            </div>
                        </form>
                    )}

                    {/* --- MOD: SEÇME (Choice) --- */}
                    {mode === 'choice' && !showFullResult && (
                        <div className="grid grid-cols-1 gap-3 w-full animate-fade-in-up">
                            {options.map((opt, idx) => (
                                <button
                                    key={opt.id}
                                    onClick={() => handleAnswer(opt.id === currentWord.id)}
                                    className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-700 text-lg hover:border-indigo-500 hover:ring-4 hover:ring-indigo-500/10 active:scale-[0.98] transition-all flex items-center gap-4 group text-left shadow-sm"
                                >
                                    <span className="w-10 h-10 rounded-xl bg-slate-50 text-slate-500 border border-slate-200 flex items-center justify-center text-sm font-bold group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-colors shrink-0">
                                        {idx + 1}
                                    </span>
                                    <span className="truncate">{opt.word}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* --- MOD: KART (Flip) --- */}
                    {mode === 'flip' && !showFullResult && (
                        <div className="w-full h-80 perspective cursor-pointer group" onClick={() => setFlipped(!flipped)}>
                            <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${flipped ? 'rotate-y-180' : ''}`}>
                                {/* Ön Yüz: Türkçe */}
                                <div className="absolute w-full h-full bg-white rounded-3xl flex flex-col items-center justify-center backface-hidden border-2 border-slate-100 shadow-lg group-hover:shadow-xl transition-shadow">
                                    <div className="text-3xl font-bold text-slate-800 mb-2">{currentWord.meaning}</div>
                                    <div className="text-sm font-bold text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full">Cevabı Gör</div>
                                </div>

                                {/* Arka Yüz: İngilizce */}
                                <div className="absolute w-full h-full bg-slate-900 rounded-3xl flex flex-col items-center justify-center backface-hidden rotate-y-180 border-2 border-slate-800 shadow-xl p-6">
                                    <div className="text-3xl font-bold text-white mb-2">{currentWord.word}</div>
                                    <p className="text-slate-400 text-sm italic text-center mb-6">"{currentWord.example_en}"</p>

                                    <div className="flex gap-3 w-full" onClick={(e) => e.stopPropagation()}>
                                        <button onClick={() => handleAnswer(false)} className="flex-1 py-3 bg-red-500/20 border border-red-500/50 text-red-400 rounded-xl font-bold hover:bg-red-500 hover:text-white transition">Bilmiyorum</button>
                                        <button onClick={() => handleAnswer(true)} className="flex-1 py-3 bg-green-500/20 border border-green-500/50 text-green-400 rounded-xl font-bold hover:bg-green-500 hover:text-white transition">Biliyorum</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* --- SONUÇ OVERLAY (TAM EKRAN) --- */}
            {showFullResult && (
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md flex flex-col items-center justify-center z-50 animate-fade-in p-6">
                    <div className={`p-8 rounded-[2rem] shadow-2xl w-full max-w-sm text-center animate-scale-up bg-white relative overflow-hidden`}>

                        {/* Arka Plan Efekti */}
                        <div className={`absolute top-0 left-0 w-full h-2 ${status === 'success' ? 'bg-green-500' : 'bg-red-500'}`}></div>

                        {/* İkon */}
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg ${status === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                            {status === 'success' ? <Check size={40} strokeWidth={4} /> : <X size={40} strokeWidth={4} />}
                        </div>

                        {/* Metin */}
                        <h3 className={`text-2xl font-black mb-6 ${status === 'success' ? 'text-slate-800' : 'text-slate-800'}`}>
                            {status === 'success' ? 'Harika, Doğru!' : 'Üzgünüm, Yanlış!'}
                        </h3>

                        {/* Doğru Cevap Kartı */}
                        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 mb-6 relative">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-3 py-0.5 rounded-full text-[10px] font-bold text-slate-400 border border-slate-100 uppercase tracking-wide shadow-sm">
                                {status === 'success' ? 'Kelime' : 'Doğru Cevap'}
                            </div>
                            <div className="text-3xl font-bold text-slate-800 flex items-center justify-center gap-2 mb-2">
                                {currentWord.word}
                                <button onClick={() => playAudio()} className="p-2 bg-indigo-100 text-indigo-600 rounded-full hover:bg-indigo-200 hover:scale-110 transition">
                                    <Volume2 size={20} />
                                </button>
                            </div>
                            <p className="text-sm text-slate-500 italic">"{currentWord.example_en}"</p>
                            <div className="mt-3 h-px w-full bg-slate-200"></div>
                            <p className="text-sm text-slate-400 mt-2">{currentWord.example_tr}</p>
                        </div>

                        {/* Devam Butonu - OTO ODAKLANMA */}
                        <button
                            onClick={nextQuestion}
                            autoFocus
                            className={`w-full py-4 rounded-xl font-bold text-white text-lg shadow-xl transition active:scale-95 flex items-center justify-center gap-2 ${status === 'success' ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200' : 'bg-slate-800 hover:bg-slate-900 shadow-slate-300'}`}
                        >
                            Devam Et <span className="opacity-50 text-xs font-normal">(Enter)</span>
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
}