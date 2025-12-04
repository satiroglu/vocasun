'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
    ArrowLeft, Volume2, Check, X, PenTool, LayoutGrid,
    BookOpen, Sparkles, SkipForward, Trophy, RotateCcw, EyeOff, Clock,
    Lightbulb, Info, AlertCircle, LogOut
} from 'lucide-react';
import { VocabularyItem } from '@/types';
import Button from '@/components/Button';
import { useUser } from '@/hooks/useUser';
import { useProfile } from '@/hooks/useProfile';
import { useLearnSession, useChoiceOptions, useSaveProgress } from '@/hooks/useLearnSession';
import { getEditDistance } from '@/lib/utils';

type Mode = 'write' | 'choice' | 'flip';
type FeedbackStatus = 'idle' | 'success' | 'error';

export default function Learn() {
    const { user } = useUser();
    const { data: profile } = useProfile(user?.id);
    const { data: sessionData, isLoading: sessionLoading, isRefetching, refetch: refetchSession } = useLearnSession(user?.id);
    const saveProgressMutation = useSaveProgress();

    const [mode, setMode] = useState<Mode>('write');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [sessionStats, setSessionStats] = useState({ correct: 0, wrong: 0, earnedXp: 0 });
    const [isSessionFinished, setIsSessionFinished] = useState(false);
    const [userInput, setUserInput] = useState('');
    const [status, setStatus] = useState<FeedbackStatus>('idle');
    const [flipped, setFlipped] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [showFullResult, setShowFullResult] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const [hintLevel, setHintLevel] = useState(0);
    const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'warning' | 'info', text: string } | null>(null);
    const [showExitModal, setShowExitModal] = useState(false);

    const [localQueue, setLocalQueue] = useState<VocabularyItem[]>([]);
    const [initialSessionLength, setInitialSessionLength] = useState(0);

    useEffect(() => {
        if (sessionData?.words) {
            setLocalQueue(sessionData.words);
            setInitialSessionLength(sessionData.words.length);
        }
    }, [sessionData]);

    const progressMap = sessionData?.progressMap || {};
    const currentWord = localQueue[currentIndex];
    const currentProgress = currentWord ? progressMap[currentWord.id] : undefined;
    const { data: choiceOptions = [], isLoading: isOptionsLoading } = useChoiceOptions(currentWord?.id);

    const startNewSession = () => {
        setIsSessionFinished(false);
        setSessionStats({ correct: 0, wrong: 0, earnedXp: 0 });
        setCurrentIndex(0);
        setLocalQueue([]);
        setInitialSessionLength(0);
        refetchSession();
    };

    useEffect(() => {
        setStatus('idle');
        setShowFullResult(false);
        setUserInput('');
        setFlipped(false);
        setIsProcessing(false);
        setHintLevel(0);
        setFeedbackMsg(null);

        if (mode === 'write') {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [currentIndex, mode]);

    const stopAudio = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current = null;
        }
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
    };

    // --- GÜNCELLENMİŞ AKILLI SES FONKSİYONU ---
    const playAudio = (overrideAccent?: 'US' | 'UK', textToSpeak?: string) => {
        stopAudio();

        // 1. Özel Metin Okuma (Şıklar vb.)
        if (textToSpeak) {
            const u = new SpeechSynthesisUtterance(textToSpeak);
            const targetAccent = overrideAccent || user?.accent_preference || 'US';
            u.lang = targetAccent === 'UK' ? 'en-GB' : 'en-US';
            u.rate = 0.9;
            window.speechSynthesis.speak(u);
            return;
        }

        const wordToPlay = currentWord?.word;
        if (!wordToPlay || !currentWord) return;

        // 2. Aksan Belirleme (Butona basıldıysa o, yoksa profil ayarı)
        const targetAccent = overrideAccent || user?.accent_preference || 'US';

        let audioSrc: string | null | undefined = null;

        if (targetAccent === 'UK') {
            audioSrc = currentWord.audio_uk;
        } else {
            audioSrc = currentWord.audio_us;
        }

        // 3. Fallback (İstenen yoksa diğerlerini dene)
        if (!audioSrc) {
            audioSrc = currentWord.audio_us || currentWord.audio_uk || currentWord.audio_url;
        }

        if (audioSrc) {
            const audio = new Audio(audioSrc);
            audioRef.current = audio;
            audio.play().catch(() => { });
        } else {
            // Hiçbiri yoksa Tarayıcı Sesi
            const u = new SpeechSynthesisUtterance(wordToPlay);
            u.lang = targetAccent === 'UK' ? 'en-GB' : 'en-US';
            window.speechSynthesis.speak(u);
        }
    };

    const handleAnswer = async (answer: string | null, isMasteredManually: boolean = false, visualCorrect: boolean = false) => {
        if (isProcessing || !user || !currentWord) return;
        setIsProcessing(true);

        setStatus(visualCorrect || isMasteredManually ? 'success' : 'error');
        setShowFullResult(true);

        if (visualCorrect || isMasteredManually) {
            playAudio();
        } else {
            playAudio();
        }

        try {
            const response = await saveProgressMutation.mutateAsync({
                userId: user.id,
                vocabId: currentWord.id,
                userAnswer: answer,
                mode: mode,
                isMastered: isMasteredManually
            });

            if (response) {
                const isServerCorrect = response.is_correct || isMasteredManually;
                const xpGained = response.xp_gained || 0;

                setSessionStats(prev => ({
                    ...prev,
                    correct: prev.correct + (isServerCorrect ? 1 : 0),
                    wrong: prev.wrong + (isServerCorrect ? 0 : 1),
                    earnedXp: prev.earnedXp + xpGained
                }));
            }
        } catch (error) {
            console.error("Cevap kaydedilemedi:", error);
        }
    };

    const checkWriteAnswer = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentWord) return;

        const input = userInput.trim();
        const inputLower = input.toLowerCase();
        const target = currentWord.word.toLowerCase();

        let isVisuallyCorrect = false;

        if (inputLower === target) {
            isVisuallyCorrect = true;
        } else if (currentWord.synonyms && currentWord.synonyms.some(s => s.toLowerCase() === inputLower)) {
            setFeedbackMsg({
                type: 'info',
                text: `Alternatif doğru cevap: "${input}". Biz "${currentWord.word}" kelimesini çalışıyoruz.`
            });
            isVisuallyCorrect = true;
        } else if (currentWord.antonyms && currentWord.antonyms.some(a => a.toLowerCase() === inputLower)) {
            setFeedbackMsg({
                type: 'warning',
                text: `Dikkat! "${input}" kelimesi "${currentWord.word}" kelimesinin zıt anlamlısıdır.`
            });
            isVisuallyCorrect = false;
        } else {
            const distance = getEditDistance(inputLower, target);
            const tolerance = target.length > 5 ? 2 : 1;
            if (distance <= tolerance && distance > 0) {
                setFeedbackMsg({
                    type: 'warning',
                    text: `Ufak bir yazım hatası: "${input}". Doğrusu: "${currentWord.word}".`
                });
                isVisuallyCorrect = true;
            }
        }

        handleAnswer(input, false, isVisuallyCorrect);
    };

    const handleAlreadyKnow = async () => {
        setFeedbackMsg({
            type: 'info',
            text: 'Bu kelimeyi "Biliyorum" olarak işaretlediniz.'
        });
        await handleAnswer(null, true, true);
    };

    const showHint = () => {
        setHintLevel(prev => Math.min(prev + 1, 1));
        if (inputRef.current) inputRef.current.blur();
    };

    const nextQuestion = () => {
        stopAudio();
        if (currentIndex < localQueue.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            setCurrentIndex(currentIndex + 1);
            setTimeout(() => {
                setIsSessionFinished(true);
            }, 1000);
        }
    };

    const options = mode === 'choice' && currentWord
        ? [currentWord, ...choiceOptions].sort(() => Math.random() - 0.5)
        : [];

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
                        const selectedOption = options[index];
                        handleAnswer(selectedOption.word, false, selectedOption.id === currentWord?.id);
                    }
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [status, showFullResult, mode, options, currentWord]);

    if (sessionLoading || isRefetching || localQueue.length === 0) return (
        <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-slate-50 pt-16">
            <div className="animate-spin w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
            <p className="mt-4 text-indigo-600 font-bold animate-pulse">Oturum Hazırlanıyor...</p>
        </div>
    );

    if (isSessionFinished) return (
        <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 bg-slate-50 text-center font-sans pt-16">
            <div className="bg-white p-8 sm:p-12 rounded-xl shadow-xl border border-slate-100 w-full max-w-md animate-scale-up">
                <div className="w-20 h-20 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-yellow-200">
                    <Trophy size={40} className="fill-yellow-600" />
                </div>
                <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Tebrikler! 🎉</h2>
                <p className="text-slate-500 mb-8 font-medium">Bu oturumu başarıyla tamamladın.</p>

                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                        <div className="text-3xl font-black text-green-600">{sessionStats.correct}</div>
                        <div className="text-xs font-bold text-green-500 uppercase tracking-wide">Doğru</div>
                    </div>
                    <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                        <div className="text-3xl font-black text-indigo-600">+{sessionStats.earnedXp}</div>
                        <div className="text-xs font-bold text-indigo-500 uppercase tracking-wide">XP Kazanıldı</div>
                    </div>
                </div>

                <div className="space-y-3">
                    <Button onClick={startNewSession} className="w-full h-14 text-lg shadow-indigo-200" icon={<RotateCcw size={20} />}>
                        Yeni Oturum Başlat
                    </Button>
                    <Link href="/dashboard" className="block">
                        <Button variant="outline" className="w-full h-14 text-lg border-2">Panel'e Dön</Button>
                    </Link>
                </div>
            </div>
        </div>
    );

    if (!currentWord) {
        if (currentIndex === initialSessionLength && !isSessionFinished) {
            return (
                <div className="h-[100dvh] bg-slate-50 flex flex-col overflow-hidden font-sans relative pt-0">
                    <div className="flex-1 relative flex flex-col w-full max-w-lg mx-auto overflow-y-auto mt-32 mb-4 items-center justify-center">
                        <div className="animate-pulse text-indigo-600 font-bold">Tamamlanıyor...</div>
                    </div>
                </div>
            );
        }
        return null;
    }

    const isNew = currentProgress?.is_new ?? true;

    const getLevelColor = (level: string | undefined) => {
        if (!level) return 'bg-slate-100 text-slate-600 border-slate-200';
        const l = level.toLowerCase();
        if (l.startsWith('a')) return 'bg-green-100 text-green-700 border-green-200';
        if (l.startsWith('b')) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        if (l.startsWith('c')) return 'bg-red-100 text-red-700 border-red-200';
        return 'bg-slate-100 text-slate-600 border-slate-200';
    };

    // --- GÜNCELLENMİŞ BADGE YAPISI ---
    const WordBadges = ({ small = false }: { small?: boolean }) => (
        // flex-wrap ve justify-center ile taşmayı engelledik ve ortaladık
        <div className={`flex flex-wrap items-center justify-center ${small ? 'gap-1.5' : 'gap-2'}`}>
            <div className={`inline-flex items-center gap-1.5 ${small ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'} rounded-full font-bold uppercase tracking-wide border ${isNew
                ? 'bg-blue-100 text-blue-700 border-blue-200'
                : 'bg-orange-100 text-orange-700 border-orange-200'
                }`}>
                {isNew ? <Sparkles size={small ? 10 : 12} /> : <Clock size={small ? 10 : 12} />}
                {isNew ? 'YENİ' : 'TEKRAR'}
            </div>
            {currentWord.level && (
                <div className={`inline-flex items-center gap-1.5 ${small ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'} rounded-full border font-bold uppercase tracking-wide ${getLevelColor(currentWord.level)}`}>
                    {currentWord.level}
                </div>
            )}
            {currentWord.type && (
                <div className={`inline-flex items-center gap-1.5 ${small ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'} rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-bold uppercase tracking-wide`}>
                    {currentWord.type}
                </div>
            )}
        </div>
    );

    const progressPercentage = initialSessionLength > 0
        ? Math.min(100, (currentIndex / initialSessionLength) * 100)
        : 0;

    return (
        <div className="h-[100dvh] flex flex-col bg-slate-50 overflow-hidden font-sans">
            <div className="h-16 px-4 flex items-center justify-between bg-white border-b border-slate-200 shrink-0 z-20">
                <button onClick={() => setShowExitModal(true)} className="p-2.5 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition"><ArrowLeft size={28} /></button>

                <div className="flex gap-1 bg-slate-100 p-1.5 rounded-xl overflow-x-auto no-scrollbar">
                    <button onClick={() => setMode('write')} className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${mode === 'write' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5' : 'text-slate-400 hover:text-slate-600'}`}>
                        <PenTool size={20} />
                        <span className={`text-sm font-bold ${mode === 'write' ? 'block' : 'hidden sm:block'}`}>Yaz</span>
                    </button>
                    <button onClick={() => setMode('choice')} className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${mode === 'choice' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5' : 'text-slate-400 hover:text-slate-600'}`}>
                        <LayoutGrid size={20} />
                        <span className={`text-sm font-bold ${mode === 'choice' ? 'block' : 'hidden sm:block'}`}>Seç</span>
                    </button>
                    <button onClick={() => setMode('flip')} className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${mode === 'flip' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5' : 'text-slate-400 hover:text-slate-600'}`}>
                        <BookOpen size={20} />
                        <span className={`text-sm font-bold ${mode === 'flip' ? 'block' : 'hidden sm:block'}`}>Kart</span>
                    </button>
                </div>
            </div>

            <div className="bg-white border-b border-slate-100 px-4 py-2 shrink-0 z-10">
                <div className="max-w-lg mx-auto w-full">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mb-1.5">
                        <span>İlerleme</span>
                        <span>{currentIndex} / {initialSessionLength}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 transition-all duration-500 ease-out rounded-full" style={{ width: `${progressPercentage}%` }}></div>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col w-full max-w-lg mx-auto overflow-hidden relative">
                <div className="flex-1 flex flex-col p-4 w-full h-full">
                    {!showFullResult && (
                        <div className="shrink-0 flex justify-end mb-2 h-8">
                            <button onClick={handleAlreadyKnow} className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-full text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all shadow-sm active:scale-95 group">
                                <EyeOff size={14} className="group-hover:text-indigo-600" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Biliyorum</span>
                            </button>
                        </div>
                    )}

                    <div className={`flex-1 flex flex-col items-center justify-center min-h-0 w-full ${mode === 'flip' ? 'pb-0' : 'pb-4'}`}>
                        {currentWord.image_url && !showFullResult && mode !== 'flip' && (
                            <div className="mb-4 w-32 h-32 shrink-0 relative rounded-xl overflow-hidden shadow-md border-2 border-white ring-1 ring-slate-100">
                                <img src={currentWord.image_url} alt="Word visual" className="object-cover w-full h-full" />
                            </div>
                        )}

                        {mode !== 'flip' && (
                            <div className="text-center w-full animate-fade-in flex flex-col items-center justify-center">
                                <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mb-3 break-words leading-tight px-2">
                                    {currentWord.meaning}
                                </h2>
                                <div className="mb-2 scale-90 origin-center">
                                    <WordBadges />
                                </div>
                                <p className="text-slate-400 font-medium text-xs uppercase tracking-wide">İngilizcesi nedir?</p>
                            </div>
                        )}

                        {mode === 'flip' && !showFullResult && (
                            <div className="w-full h-full max-h-[500px] perspective cursor-pointer group" onClick={() => setFlipped(!flipped)}>
                                <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${flipped ? 'rotate-y-180' : ''}`}>
                                    <div className="absolute w-full h-full bg-white rounded-2xl flex flex-col items-center justify-center backface-hidden border-2 border-slate-100 shadow-lg group-hover:shadow-xl transition-shadow p-6">
                                        <div className="text-3xl font-black text-slate-800 mb-4 text-center">{currentWord.meaning}</div>
                                        <div className="text-xs font-bold text-indigo-500 bg-indigo-50 px-3 py-1.5 rounded-full uppercase tracking-wide">Cevabı Gör</div>
                                    </div>
                                    <div className="absolute w-full h-full bg-indigo-50 rounded-2xl flex flex-col items-center justify-center backface-hidden rotate-y-180 border-2 border-indigo-100 shadow-xl p-6">
                                        <div className="flex-1 flex flex-col items-center justify-center">
                                            <div className="text-3xl font-black text-indigo-900 mb-2 text-center">{currentWord.word}</div>

                                            {/* --- KART ARKASI SES KONTROLLERİ --- */}
                                            <div className="flex flex-col items-center justify-center gap-3 my-3">
                                                {/* Büyük Ana Buton */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        playAudio();
                                                    }}
                                                    className="w-16 h-16 flex items-center justify-center bg-indigo-100 text-indigo-600 rounded-full hover:bg-indigo-200 hover:scale-105 active:scale-95 transition-all shadow-sm group"
                                                    title="Dinle"
                                                >
                                                    <Volume2 size={32} className="group-active:scale-90 transition-transform" />
                                                </button>

                                                {/* Küçük Aksan Seçimi */}
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            playAudio('US');
                                                        }}
                                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all active:scale-95
                                                            ${user?.accent_preference === 'US'
                                                                ? 'bg-indigo-50 border-indigo-200 text-indigo-700 ring-1 ring-indigo-500/20'
                                                                : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-600'
                                                            }`}
                                                        title="Amerikan Aksanı"
                                                    >
                                                        <Volume2 size={13} />
                                                        <span>US</span>
                                                    </button>

                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            playAudio('UK');
                                                        }}
                                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all active:scale-95
                                                            ${user?.accent_preference === 'UK'
                                                                ? 'bg-indigo-50 border-indigo-200 text-indigo-700 ring-1 ring-indigo-500/20'
                                                                : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-600'
                                                            }`}
                                                        title="İngiliz Aksanı"
                                                    >
                                                        <Volume2 size={13} />
                                                        <span>UK</span>
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="space-y-3 w-full mt-2">
                                                <div className="bg-white/60 p-3 rounded-xl border border-indigo-100/50">
                                                    <p className="text-indigo-800 text-sm italic text-center font-medium">"{currentWord.example_en}"</p>
                                                </div>
                                                <div className="bg-white/60 p-3 rounded-xl border border-indigo-100/50">
                                                    <p className="text-indigo-600 text-sm text-center">{currentWord.example_tr}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-3 w-full mt-auto pt-6" onClick={(e) => e.stopPropagation()}>
                                            <button onClick={() => handleAnswer('WRONG', false, false)} className="flex-1 py-3 bg-white border-2 border-red-100 text-red-500 rounded-xl font-bold hover:bg-red-50 hover:border-red-200 transition text-sm shadow-sm">Bilmiyorum</button>
                                            <button onClick={() => handleAnswer('CORRECT', false, true)} className="flex-1 py-3 bg-white border-2 border-green-100 text-green-500 rounded-xl font-bold hover:bg-green-50 hover:border-green-200 transition text-sm shadow-sm">Biliyorum</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="shrink-0 w-full mt-auto">
                        {mode === 'write' && !showFullResult && (
                            <div className="w-full animate-fade-in-up">
                                <form onSubmit={checkWriteAnswer} className="w-full relative">
                                    <div className="bg-white p-4 pr-12 rounded-xl border-2 border-slate-200 shadow-sm mb-4 relative">
                                        <button
                                            type="button"
                                            onClick={showHint}
                                            className={`absolute top-2 right-2 p-2 rounded-full transition-all duration-300 group/hint z-20 ${hintLevel > 0 ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400 hover:bg-amber-50 hover:text-amber-500'}`}
                                            title="İpucu Al"
                                            disabled={hintLevel >= 1}
                                        >
                                            <Lightbulb size={18} className={`transition-all duration-300 ${hintLevel > 0 ? 'fill-amber-500' : 'group-hover/hint:fill-amber-500'}`} />
                                        </button>

                                        {(() => {
                                            const escapedWord = currentWord.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                                            const parts = currentWord.example_en.split(new RegExp(`(${escapedWord})`, 'gi'));
                                            if (parts.length === 1) {
                                                return (
                                                    <div className="flex flex-col items-center gap-3 pt-2">
                                                        <p className="text-slate-500 italic text-sm line-clamp-2">"{currentWord.example_en}"</p>
                                                        <input
                                                            ref={inputRef}
                                                            value={userInput}
                                                            onChange={(e) => { setUserInput(e.target.value); setFeedbackMsg(null); }}
                                                            className="w-full text-center text-lg font-bold p-3 bg-slate-50 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-slate-800 placeholder:text-slate-300"
                                                            placeholder="Kelimeyi yazın..."
                                                            autoComplete="off"
                                                            autoCorrect="off"
                                                            autoCapitalize="off"
                                                        />
                                                    </div>
                                                );
                                            }
                                            const firstMatchIndex = parts.findIndex(p => p.toLowerCase() === currentWord.word.toLowerCase());
                                            return (
                                                <div className="text-center leading-loose">
                                                    {parts.map((part, i) => {
                                                        if (part.toLowerCase() === currentWord.word.toLowerCase()) {
                                                            return (
                                                                <input
                                                                    key={i}
                                                                    ref={i === firstMatchIndex ? inputRef : null}
                                                                    value={userInput}
                                                                    onChange={(e) => { setUserInput(e.target.value); setFeedbackMsg(null); }}
                                                                    className="inline-block mx-1 text-center text-indigo-600 font-bold border-b-2 border-indigo-300 focus:border-indigo-600 outline-none bg-indigo-50/50 rounded px-2 py-0.5 transition-colors placeholder:text-transparent min-w-[80px]"
                                                                    style={{ width: `${Math.max(80, part.length * 14)}px` }}
                                                                    autoComplete="off"
                                                                    autoCorrect="off"
                                                                    autoCapitalize="off"
                                                                />
                                                            );
                                                        }
                                                        return <span key={i} className="text-slate-600">{part}</span>;
                                                    })}
                                                </div>
                                            );
                                        })()}
                                    </div>

                                    <div className="flex gap-3">
                                        <button type="button" onClick={() => handleAnswer('SKIP', false, false)} className="flex-1 py-3.5 bg-white border-2 border-slate-100 text-slate-500 font-bold rounded-xl hover:bg-slate-50 hover:text-slate-700 transition flex items-center justify-center gap-2 text-sm">
                                            <SkipForward size={18} /> Bilmiyorum
                                        </button>
                                        <button type="submit" className="flex-[2] py-3.5 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 active:scale-[0.98] transition hover:bg-indigo-700 flex items-center justify-center gap-2 text-sm">
                                            Kontrol Et
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {mode === 'choice' && !showFullResult && (
                            <div className="grid grid-cols-1 gap-2 w-full animate-fade-in-up">
                                {isOptionsLoading || options.length < 2 ? (
                                    [1, 2, 3, 4].map((i) => (
                                        <div key={i} className="w-full p-3 bg-white border-2 border-slate-100 rounded-xl flex items-center gap-3 animate-pulse">
                                            <div className="w-8 h-8 rounded-lg bg-slate-200 shrink-0"></div>
                                            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                                        </div>
                                    ))
                                ) : (
                                    options.map((opt, idx) => (
                                        <button
                                            key={opt.id}
                                            onClick={() => handleAnswer(opt.word, false, opt.id === currentWord.id)}
                                            className="w-full p-3 bg-white border-2 border-slate-100 rounded-xl font-bold text-slate-700 text-base hover:border-indigo-500 hover:ring-2 hover:ring-indigo-500/10 active:scale-[0.98] transition-all flex items-center gap-3 group text-left shadow-sm"
                                        >
                                            <span className="w-8 h-8 rounded-lg bg-slate-50 text-slate-500 border border-slate-200 flex items-center justify-center text-xs font-bold group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-colors shrink-0">
                                                {idx + 1}
                                            </span>
                                            <span className="truncate">{opt.word}</span>
                                        </button>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showFullResult && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex flex-col items-center justify-center z-[60] animate-fade-in p-6">
                    <div className={`p-8 rounded-xl shadow-2xl w-full max-w-sm text-center animate-scale-up bg-white relative overflow-hidden`}>
                        <div className={`absolute top-0 left-0 w-full h-2 ${status === 'success' ? 'bg-green-500' : 'bg-red-500'}`}></div>

                        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg ${status === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                            {status === 'success' ? <Check size={40} strokeWidth={4} /> : <X size={40} strokeWidth={4} />}
                        </div>

                        <h3 className={`text-2xl font-black mb-4 ${status === 'success' ? 'text-slate-800' : 'text-slate-800'}`}>
                            {status === 'success' ? 'Harika, Doğru!' : 'Üzgünüm, Yanlış!'}
                        </h3>

                        {feedbackMsg && (
                            <div className={`mb-4 p-3 rounded-xl text-sm font-medium border ${feedbackMsg.type === 'info'
                                ? 'bg-blue-50 text-blue-700 border-blue-100'
                                : 'bg-amber-50 text-amber-700 border-amber-100'
                                }`}>
                                {feedbackMsg.text}
                            </div>
                        )}

                        <div className="bg-slate-50 rounded-xl p-5 pt-8 border border-slate-100 mb-6 relative mt-6">
                            {/* ROZETLER DÜZELTİLDİ: w-full ve justify-center */}
                            <div className="absolute -top-3 left-0 w-full flex justify-center px-4">
                                <WordBadges small />
                            </div>

                            <div className="text-3xl font-bold text-slate-800 flex items-center justify-center gap-2 mb-2 mt-4">
                                {currentWord.word}
                            </div>

                            {/* --- SONUÇ EKRANI SES KONTROLLERİ --- */}
                            <div className="flex flex-col items-center justify-center gap-3 my-3">
                                {/* Büyük Ana Buton */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        playAudio();
                                    }}
                                    className="w-16 h-16 flex items-center justify-center bg-indigo-100 text-indigo-600 rounded-full hover:bg-indigo-200 hover:scale-105 active:scale-95 transition-all shadow-sm group"
                                    title="Dinle"
                                >
                                    <Volume2 size={32} className="group-active:scale-90 transition-transform" />
                                </button>

                                {/* Küçük Aksan Seçimi */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            playAudio('US');
                                        }}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all active:scale-95
                                            ${user?.accent_preference === 'US'
                                                ? 'bg-indigo-50 border-indigo-200 text-indigo-700 ring-1 ring-indigo-500/20'
                                                : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-600'
                                            }`}
                                        title="Amerikan Aksanı"
                                    >
                                        <Volume2 size={13} />
                                        <span>US</span>
                                    </button>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            playAudio('UK');
                                        }}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all active:scale-95
                                            ${user?.accent_preference === 'UK'
                                                ? 'bg-indigo-50 border-indigo-200 text-indigo-700 ring-1 ring-indigo-500/20'
                                                : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-600'
                                            }`}
                                        title="İngiliz Aksanı"
                                    >
                                        <Volume2 size={13} />
                                        <span>UK</span>
                                    </button>
                                </div>
                            </div>

                            <p className="text-sm text-slate-500 italic mt-2">"{currentWord.example_en}"</p>
                            <div className="mt-3 h-px w-full bg-slate-200"></div>
                            <p className="text-sm text-slate-400 mt-2">{currentWord.example_tr}</p>
                        </div>
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

            {hintLevel > 0 && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="absolute inset-0 bg-indigo-900/40 backdrop-blur-[4px]" onClick={() => setHintLevel(0)}></div>
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm relative z-10 overflow-hidden animate-in zoom-in-95 duration-300 ring-1 ring-indigo-50">
                        <div className="h-24 bg-amber-50 relative overflow-hidden flex items-center justify-center border-b border-amber-100">
                            <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-200 via-amber-50 to-transparent"></div>
                            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-amber-100 flex items-center justify-center transform rotate-3 relative z-10">
                                <Lightbulb size={32} className="fill-amber-400 text-amber-500" />
                            </div>
                        </div>
                        <div className="p-6 pt-4 text-center">
                            <h3 className="text-lg font-black text-slate-700 uppercase tracking-wide mb-1">İpucu</h3>
                            <div className="w-10 h-1 bg-amber-200 rounded-full mx-auto mb-6"></div>
                            {currentWord.definition && (
                                <p className="text-slate-600 text-lg font-medium leading-relaxed mb-8">
                                    "{currentWord.definition}"
                                </p>
                            )}
                            <button onClick={() => setHintLevel(0)} className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 active:scale-95 transition-transform hover:bg-indigo-700">
                                Anladım
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showExitModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowExitModal(false)}></div>
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm relative z-10 overflow-hidden animate-in zoom-in-95 duration-300 p-6 text-center">
                        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <LogOut size={32} />
                        </div>
                        <h3 className="text-xl font-black text-slate-800 mb-2">Çıkmak İstediğine Emin misin?</h3>
                        <p className="text-slate-500 font-medium mb-6">Şu an çok iyi gidiyorsun! Oturumu yarıda bırakırsan serini bozabilirsin.</p>
                        <div className="space-y-3">
                            <button onClick={() => setShowExitModal(false)} className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 active:scale-95 transition-transform hover:bg-indigo-700">
                                Öğrenmeye Devam Et
                            </button>
                            <Link href="/dashboard" className="block w-full">
                                <button className="w-full py-3.5 bg-white border-2 border-slate-100 text-slate-400 rounded-xl font-bold text-lg hover:bg-slate-50 hover:text-slate-600 transition">
                                    Pes Ediyorum
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}