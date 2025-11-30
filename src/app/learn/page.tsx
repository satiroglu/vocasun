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
import { useLearnSession, useChoiceOptions, useSaveProgress } from '@/hooks/useLearnSession';
import { getEditDistance } from '@/lib/utils'; // Utils dosyasını oluşturduğunu varsayıyorum

type Mode = 'write' | 'choice' | 'flip';
type FeedbackStatus = 'idle' | 'success' | 'error';

export default function Learn() {
    // Hooks
    const { user } = useUser();
    const { data: sessionData, isLoading: sessionLoading, isRefetching, refetch: refetchSession } = useLearnSession(user?.id);
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
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [showFullResult, setShowFullResult] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // --- YENİ STATE'LER (Akıllı Özellikler) ---
    const [hintLevel, setHintLevel] = useState(0); // 0: Yok, 1: Tanım, 2: Maskeli, 3: Cümle
    const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'warning' | 'info', text: string } | null>(null);
    const [showExitModal, setShowExitModal] = useState(false);

    // Local Queue State
    const [localQueue, setLocalQueue] = useState<VocabularyItem[]>([]);
    const [initialSessionLength, setInitialSessionLength] = useState(0);

    // Initialize localQueue
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

    // Yeni Oturum Başlatma
    const startNewSession = () => {
        setIsSessionFinished(false);
        setSessionStats({ correct: 0, wrong: 0, earnedXp: 0 });
        setCurrentIndex(0);
        setLocalQueue([]);
        setInitialSessionLength(0);
        refetchSession();
    };

    // Soru hazırlama ve State Resetleme
    useEffect(() => {
        setStatus('idle');
        setShowFullResult(false);
        setUserInput('');
        setFlipped(false);
        setIsProcessing(false);

        // Her soruda ipucu ve mesajları sıfırla
        setHintLevel(0);
        setFeedbackMsg(null);

        if (mode === 'write') {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [currentIndex, mode]);

    // Ses Durdurma
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

    const playAudio = (text?: string) => {
        stopAudio();
        const wordToPlay = text || currentWord?.word;
        if (!wordToPlay) return;

        if (currentWord?.audio_url && !text) {
            const audio = new Audio(currentWord.audio_url);
            audioRef.current = audio;
            audio.play().catch(() => { });
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

        await saveProgressMutation.mutateAsync({
            userId: user.id,
            vocabId: currentWord.id,
            isCorrect
        });
    };

    // --- GELİŞMİŞ CEVAP KONTROLÜ ---
    const checkWriteAnswer = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentWord) return;

        const input = userInput.trim().toLowerCase();
        const target = currentWord.word.toLowerCase();

        // 1. TAM EŞLEŞME
        if (input === target) {
            handleAnswer(true);
            return;
        }

        // 2. EŞ ANLAMLI (Doğru kabul et ama uyar)
        if (currentWord.synonyms && currentWord.synonyms.some(s => s.toLowerCase() === input)) {
            setFeedbackMsg({
                type: 'info',
                text: `Alternatif doğru cevap: "${userInput}". Biz "${currentWord.word}" kelimesini çalışıyoruz.`
            });
            handleAnswer(true); // <--- Doğru kabul edip geçiyoruz
            return;
        }

        // 3. ZIT ANLAMLI (Yanlış kabul et ve uyar)
        if (currentWord.antonyms && currentWord.antonyms.some(a => a.toLowerCase() === input)) {
            setFeedbackMsg({
                type: 'warning',
                text: `Dikkat! "${userInput}" kelimesi "${currentWord.word}" kelimesinin zıt anlamlısıdır.`
            });
            handleAnswer(false);
            return;
        }

        // 4. YAZIM HATASI (Doğru kabul et ama uyar)
        const distance = getEditDistance(input, target);
        const tolerance = target.length > 5 ? 2 : 1; // 5 harften uzunda 2 hata, kısada 1 hata toleransı

        if (distance <= tolerance && distance > 0) {
            setFeedbackMsg({
                type: 'warning',
                text: `Ufak bir yazım hatası: "${userInput}". Doğrusu: "${currentWord.word}".`
            });
            handleAnswer(true); // <--- Doğru kabul edip geçiyoruz
            return;
        }

        // 5. YANLIŞ
        handleAnswer(false);
    };

    const showHint = () => {
        setHintLevel(prev => Math.min(prev + 1, 1));
        // Klavyeyi kapat (mobil için)
        if (inputRef.current) {
            inputRef.current.blur();
        }
    };

    const handleAlreadyKnow = async () => {
        if (isProcessing || !user || !currentWord) return;

        // Bilgilendirme mesajı göster
        setFeedbackMsg({
            type: 'info',
            text: 'Bu kelimeyi "Biliyorum" olarak işaretlediniz. Yanlışlıkla bastıysanız, "Kelimelerim" sayfasından tekrar çalışmaya ekleyebilirsiniz.'
        });

        setIsProcessing(true);
        setStatus('success'); // Doğru olarak işaretle
        setShowFullResult(true); // Sonuç ekranını göster
        playAudio();

        setSessionStats(prev => ({ ...prev, correct: prev.correct + 1, earnedXp: prev.earnedXp + 10 }));

        await saveProgressMutation.mutateAsync({
            userId: user.id,
            vocabId: currentWord.id,
            isCorrect: true,
            isMasteredManually: true
        });
        // nextQuestion() çağrısını kaldırdık, kullanıcı "Devam Et" butonuna basacak.
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
                        handleAnswer(options[index].id === currentWord?.id);
                    }
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [status, showFullResult, mode, options, currentWord]);

    // RENDER: LOADING
    if (sessionLoading || isRefetching || localQueue.length === 0) return (
        <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-slate-50 pt-16">
            <div className="animate-spin w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
            <p className="mt-4 text-indigo-600 font-bold animate-pulse">Oturum Hazırlanıyor...</p>
        </div>
    );

    // --- RENDER: SONUÇ EKRANI ---
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
                    <div className="px-4 py-3 flex items-center justify-between bg-white border-b border-slate-200 shrink-0 z-10 h-16 fixed top-0 left-0 right-0">
                        <Link href="/dashboard" className="p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition"><ArrowLeft size={24} /></Link>
                        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg opacity-50 pointer-events-none">
                            <button className="p-2 rounded-md text-slate-400"><PenTool size={22} /></button>
                            <button className="p-2 rounded-md text-slate-400"><LayoutGrid size={22} /></button>
                            <button className="p-2 rounded-md text-slate-400"><BookOpen size={22} /></button>
                        </div>
                    </div>
                    <div className="fixed top-16 left-0 right-0 bg-white border-b border-slate-100 px-4 py-3 z-10">
                        <div className="max-w-lg mx-auto w-full">
                            <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
                                <span>İlerleme</span>
                                <span>{initialSessionLength} / {initialSessionLength}</span>
                            </div>
                            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500 transition-all duration-500 ease-out rounded-full" style={{ width: '100%' }}></div>
                            </div>
                        </div>
                    </div>
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

    const WordBadges = ({ small = false }: { small?: boolean }) => (
        <div className={`flex items-center justify-center ${small ? 'gap-1.5' : 'gap-2'} flex-wrap`}>
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

            {/* --- HEADER (Fixed Height, Non-Fixed Position) --- */}
            <div className="h-16 px-4 flex items-center justify-between bg-white border-b border-slate-200 shrink-0 z-20">
                <button onClick={() => setShowExitModal(true)} className="p-2.5 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition"><ArrowLeft size={28} /></button>

                {/* Mod Değiştirici */}
                <div className="flex gap-1 bg-slate-100 p-1.5 rounded-xl overflow-x-auto no-scrollbar">
                    <button
                        onClick={() => setMode('write')}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${mode === 'write' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <PenTool size={20} />
                        <span className={`text-sm font-bold ${mode === 'write' ? 'block' : 'hidden sm:block'}`}>Yaz</span>
                    </button>
                    <button
                        onClick={() => setMode('choice')}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${mode === 'choice' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <LayoutGrid size={20} />
                        <span className={`text-sm font-bold ${mode === 'choice' ? 'block' : 'hidden sm:block'}`}>Seç</span>
                    </button>
                    <button
                        onClick={() => setMode('flip')}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${mode === 'flip' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <BookOpen size={20} />
                        <span className={`text-sm font-bold ${mode === 'flip' ? 'block' : 'hidden sm:block'}`}>Kart</span>
                    </button>
                </div>
            </div>

            {/* --- PROGRESS BAR (Shrink 0) --- */}
            <div className="bg-white border-b border-slate-100 px-4 py-2 shrink-0 z-10">
                <div className="max-w-lg mx-auto w-full">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mb-1.5">
                        <span>İlerleme</span>
                        <span>{currentIndex} / {initialSessionLength}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-indigo-500 transition-all duration-500 ease-out rounded-full"
                            style={{ width: `${progressPercentage}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* --- MAIN CONTENT (Flex 1 - Takes remaining space) --- */}
            <div className="flex-1 flex flex-col w-full max-w-lg mx-auto overflow-hidden relative">

                {/* İçerik Alanı */}
                <div className="flex-1 flex flex-col p-4 w-full h-full">

                    {/* 1. ÜST AKSİYONLAR (Biliyorum Butonu) */}
                    {!showFullResult && (
                        <div className="shrink-0 flex justify-end mb-2 h-8">
                            <button
                                onClick={handleAlreadyKnow}
                                className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-full text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all shadow-sm active:scale-95 group"
                            >
                                <EyeOff size={14} className="group-hover:text-indigo-600" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Biliyorum</span>
                            </button>
                        </div>
                    )}

                    {/* 2. SORU ALANI (Esnek - Ortalanmış) */}
                    <div className={`flex-1 flex flex-col items-center justify-center min-h-0 w-full ${mode === 'flip' ? 'pb-0' : 'pb-4'}`}>

                        {/* Görsel (Varsa) */}
                        {currentWord.image_url && !showFullResult && mode !== 'flip' && (
                            <div className="mb-4 w-32 h-32 shrink-0 relative rounded-xl overflow-hidden shadow-md border-2 border-white ring-1 ring-slate-100">
                                <img src={currentWord.image_url} alt="Word visual" className="object-cover w-full h-full" />
                            </div>
                        )}

                        {/* Kelime Metni (Flip hariç) */}
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

                        {/* Flip Modu Kartı (Burada Flex-1 olarak yerleşir) */}
                        {mode === 'flip' && !showFullResult && (
                            <div className="w-full h-full max-h-[500px] perspective cursor-pointer group" onClick={() => setFlipped(!flipped)}>
                                <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${flipped ? 'rotate-y-180' : ''}`}>
                                    {/* Ön Yüz */}
                                    <div className="absolute w-full h-full bg-white rounded-2xl flex flex-col items-center justify-center backface-hidden border-2 border-slate-100 shadow-lg group-hover:shadow-xl transition-shadow p-6">
                                        <div className="text-3xl font-black text-slate-800 mb-4 text-center">{currentWord.meaning}</div>
                                        <div className="text-xs font-bold text-indigo-500 bg-indigo-50 px-3 py-1.5 rounded-full uppercase tracking-wide">Cevabı Gör</div>
                                    </div>
                                    {/* Arka Yüz */}
                                    <div className="absolute w-full h-full bg-indigo-50 rounded-2xl flex flex-col items-center justify-center backface-hidden rotate-y-180 border-2 border-indigo-100 shadow-xl p-6">
                                        <div className="flex-1 flex flex-col items-center justify-center">
                                            <div className="text-3xl font-black text-indigo-900 mb-4 text-center">{currentWord.word}</div>
                                            <div className="space-y-3 w-full">
                                                <div className="bg-white/60 p-3 rounded-xl border border-indigo-100/50">
                                                    <p className="text-indigo-800 text-sm italic text-center font-medium">"{currentWord.example_en}"</p>
                                                </div>
                                                <div className="bg-white/60 p-3 rounded-xl border border-indigo-100/50">
                                                    <p className="text-indigo-600 text-sm text-center">{currentWord.example_tr}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-3 w-full mt-auto pt-6" onClick={(e) => e.stopPropagation()}>
                                            <button onClick={() => handleAnswer(false)} className="flex-1 py-3 bg-white border-2 border-red-100 text-red-500 rounded-xl font-bold hover:bg-red-50 hover:border-red-200 transition text-sm shadow-sm">Bilmiyorum</button>
                                            <button onClick={() => handleAnswer(true)} className="flex-1 py-3 bg-white border-2 border-green-100 text-green-500 rounded-xl font-bold hover:bg-green-50 hover:border-green-200 transition text-sm shadow-sm">Biliyorum</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 3. ETKİLEŞİM ALANI (Alt Kısım - Sabit) */}
                    <div className="shrink-0 w-full mt-auto">

                        {/* --- MOD: YAZMA (Write) --- */}
                        {mode === 'write' && !showFullResult && (
                            <div className="w-full animate-fade-in-up">


                                <form onSubmit={checkWriteAnswer} className="w-full relative">
                                    <div className="bg-white p-4 pr-12 rounded-xl border-2 border-slate-200 shadow-sm mb-4 relative">
                                        {/* İpucu Butonu */}
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
                                        <button type="button" onClick={() => handleAnswer(false)} className="flex-1 py-3.5 bg-white border-2 border-slate-100 text-slate-500 font-bold rounded-xl hover:bg-slate-50 hover:text-slate-700 transition flex items-center justify-center gap-2 text-sm">
                                            <SkipForward size={18} /> Bilmiyorum
                                        </button>
                                        <button type="submit" className="flex-[2] py-3.5 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 active:scale-[0.98] transition hover:bg-indigo-700 flex items-center justify-center gap-2 text-sm">
                                            Kontrol Et
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* --- MOD: SEÇME (Choice) --- */}
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
                                            onClick={() => handleAnswer(opt.id === currentWord.id)}
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

            {/* --- SONUÇ OVERLAY --- */}
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

                        {/* --- EXTRA FEEDBACK MESAJI (Overlay İçinde) --- */}
                        {feedbackMsg && (
                            <div className={`mb-4 p-3 rounded-xl text-sm font-medium border ${feedbackMsg.type === 'info'
                                ? 'bg-blue-50 text-blue-700 border-blue-100'
                                : 'bg-amber-50 text-amber-700 border-amber-100'
                                }`}>
                                {feedbackMsg.text}
                            </div>
                        )}

                        <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 mb-6 relative">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                <WordBadges small />
                            </div>
                            <div className="text-3xl font-bold text-slate-800 flex items-center justify-center gap-2 mb-2 mt-4">
                                {currentWord.word}
                                <button onClick={() => playAudio()} className="p-2 bg-indigo-100 text-indigo-600 rounded-full hover:bg-indigo-200 hover:scale-110 transition">
                                    <Volume2 size={20} />
                                </button>
                            </div>
                            <p className="text-sm text-slate-500 italic">"{currentWord.example_en}"</p>
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
            {/* --- PREMIUM İPUCU MODAL (MOVED TO ROOT) --- */}
            {hintLevel > 0 && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-indigo-900/40 backdrop-blur-[4px]"
                        onClick={() => setHintLevel(0)}
                    ></div>

                    {/* Modal Card */}
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm relative z-10 overflow-hidden animate-in zoom-in-95 duration-300 ring-1 ring-indigo-50">
                        {/* Header Pattern */}
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

                            <button
                                onClick={() => setHintLevel(0)}
                                className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 active:scale-95 transition-transform hover:bg-indigo-700"
                            >
                                Anladım
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* --- EXIT CONFIRMATION MODAL --- */}
            {showExitModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowExitModal(false)}></div>
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm relative z-10 overflow-hidden animate-in zoom-in-95 duration-300 p-6 text-center">
                        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <LogOut size={32} />
                        </div>
                        <h3 className="text-xl font-black text-slate-800 mb-2">Çıkmak İstediğine Emin misin?</h3>
                        <p className="text-slate-500 font-medium mb-6">
                            Şu an çok iyi gidiyorsun! Oturumu yarıda bırakırsan serini bozabilirsin. Biraz daha devam etmeye ne dersin?
                        </p>
                        <div className="space-y-3">
                            <button
                                onClick={() => setShowExitModal(false)}
                                className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 active:scale-95 transition-transform hover:bg-indigo-700"
                            >
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
        </div >
    );
}