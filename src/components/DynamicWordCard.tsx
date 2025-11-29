'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { VocabularyItem } from '@/types';
import { CheckCircle, Trophy, Loader2, RefreshCw, Volume2, BookOpen, PenTool, LayoutGrid, ChevronRight, ChevronLeft, XCircle, ArrowRight, Check, X } from 'lucide-react';
import confetti from 'canvas-confetti';

type TabMode = 'card' | 'write' | 'quiz';

export default function DynamicWordCard() {
    const [words, setWords] = useState<VocabularyItem[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [flipped, setFlipped] = useState(false);
    const [activeTab, setActiveTab] = useState<TabMode>('card');

    const [isCompleted, setIsCompleted] = useState(false);

    // Card Mode Feedback State
    const [cardFeedback, setCardFeedback] = useState<'known' | 'unknown' | null>(null);

    // Writing Mode State
    const [userInput, setUserInput] = useState('');
    const [writeStatus, setWriteStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');

    // Quiz Mode State
    const [quizOptions, setQuizOptions] = useState<string[]>([]);
    const [quizStatus, setQuizStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
    const [selectedQuizOption, setSelectedQuizOption] = useState<string | null>(null);

    const currentWord = words[currentIndex];

    // Daily Seed Logic
    const getDailySeed = () => {
        const today = new Date();
        return today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    };

    // Pseudo-random number generator based on seed
    const seededRandom = (seed: number) => {
        const x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    };

    const fetchDailyWords = async () => {
        setLoading(true);
        try {
            // 1. Get total count
            const { count, error: countError } = await supabase
                .from('vocabulary')
                .select('*', { count: 'exact', head: true });

            if (countError) throw countError;

            const total = count || 0;
            if (total === 0) {
                setLoading(false);
                return;
            }

            // 2. Generate 5 unique random offsets based on daily seed
            const seed = getDailySeed();
            const uniqueOffsets = new Set<number>();
            let attempt = 0;

            while (uniqueOffsets.size < 5 && attempt < 20) {
                const randomVal = seededRandom(seed + attempt);
                const offset = Math.floor(randomVal * total);
                uniqueOffsets.add(offset);
                attempt++;
            }

            // 3. Fetch words for these offsets
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

    useEffect(() => {
        fetchDailyWords();
    }, []);

    // Reset states when word changes
    useEffect(() => {
        setFlipped(false);
        setUserInput('');
        setWriteStatus('idle');
        setQuizStatus('idle');
        setCardFeedback(null);
        setSelectedQuizOption(null);

        if (currentWord && activeTab === 'quiz') {
            generateQuizOptions();
        }
    }, [currentIndex, activeTab, currentWord]);

    // Auto-restart timer and confetti for completion
    useEffect(() => {
        if (isCompleted) {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });

            const timer = setTimeout(() => {
                handleRestart();
            }, 120000); // 2 minutes

            return () => clearTimeout(timer);
        }
    }, [isCompleted]);

    const playAudio = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (!currentWord) return;

        if (currentWord.audio_url) {
            new Audio(currentWord.audio_url).play().catch(() => { });
        } else {
            const u = new SpeechSynthesisUtterance(currentWord.word);
            u.lang = 'en-US';
            window.speechSynthesis.speak(u);
        }
    };

    const handleNext = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (currentIndex < words.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            setIsCompleted(true);
        }
    };

    const handlePrev = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        } else {
            setCurrentIndex(words.length - 1);
        }
    };

    const handleRestart = () => {
        setIsCompleted(false);
        setCurrentIndex(0);
        setFlipped(false);
        setActiveTab('card');
    };

    const generateQuizOptions = () => {
        if (!currentWord || words.length < 2) return;
        const others = words.filter(w => w.id !== currentWord.id);
        // Get 3 random distractors (or less if not enough words)
        const shuffled = [...others].sort(() => Math.random() - 0.5).slice(0, 3);
        const options = [currentWord.meaning, ...shuffled.map(w => w.meaning)]
            .sort(() => Math.random() - 0.5);
        setQuizOptions(options);
    };

    const handleCardFeedback = (status: 'known' | 'unknown', e: React.MouseEvent) => {
        e.stopPropagation();
        setCardFeedback(status);

        // Short delay to show feedback before moving next
        setTimeout(() => {
            handleNext();
        }, 800);
    };

    const checkWriteAnswer = (e: React.FormEvent) => {
        e.preventDefault();
        if (userInput.trim().toLowerCase() === currentWord?.word.toLowerCase()) {
            setWriteStatus('correct');
            playAudio();
        } else {
            setWriteStatus('wrong');
        }
    };

    const checkQuizAnswer = (selectedMeaning: string) => {
        setSelectedQuizOption(selectedMeaning);
        if (selectedMeaning === currentWord?.meaning) {
            setQuizStatus('correct');
            playAudio();
        } else {
            setQuizStatus('wrong');
        }
    };

    if (loading) {
        return (
            <div className="relative w-full max-w-[320px] h-[400px] mx-auto bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl shadow-indigo-200/50 border border-white/60 flex flex-col items-center justify-center animate-pulse">
                <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                <p className="mt-4 text-indigo-400 font-medium text-xs">Günün Kelimeleri Hazırlanıyor...</p>
            </div>
        );
    }

    if (words.length === 0) {
        return null;
    }

    if (isCompleted) {
        return (
            <div className="relative w-full max-w-[320px] h-[400px] mx-auto bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl shadow-indigo-200/40 border border-white/60 flex flex-col items-center justify-center p-6 text-center animate-fade-in-up">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4 shadow-inner">
                    <Trophy size={32} className="text-yellow-600" />
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-2">Harika İş!</h3>
                <p className="text-slate-500 text-sm mb-6">Bugünün kelimelerini tamamladın. Yarın yeni kelimelerle görüşmek üzere!</p>

                <button
                    onClick={handleRestart}
                    className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-6 py-3 rounded-xl font-bold text-sm shadow-sm hover:bg-indigo-100 transition hover:scale-105 active:scale-95"
                >
                    <RefreshCw size={18} /> Tekrar Başlat
                </button>
            </div>
        );
    }

    return (
        <div className="relative w-full max-w-[320px] mx-auto">
            {/* --- Tabs --- */}
            <div className="flex p-1 bg-slate-100/80 backdrop-blur-sm rounded-xl mb-3 border border-white/50 shadow-sm">
                <button
                    onClick={() => setActiveTab('card')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${activeTab === 'card' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <BookOpen size={14} /> Kart
                </button>
                <button
                    onClick={() => setActiveTab('write')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${activeTab === 'write' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <PenTool size={14} /> Yaz
                </button>
                <button
                    onClick={() => setActiveTab('quiz')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${activeTab === 'quiz' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <LayoutGrid size={14} /> Test
                </button>
            </div>

            {/* --- Main Card Area --- */}
            <div className="relative h-[400px] perspective-1000 group">

                {/* CARD MODE */}
                {activeTab === 'card' && (
                    <div
                        className={`relative w-full h-full transition-all duration-700 transform-style-3d ${flipped ? 'rotate-y-180' : ''}`}
                    >
                        {/* Front */}
                        <div
                            className="absolute inset-0 w-full h-full bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl shadow-indigo-200/40 border border-white/60 flex flex-col p-6 backface-hidden z-10 cursor-pointer"
                            onClick={() => setFlipped(true)}
                        >
                            <div className="flex justify-between items-center mb-4">
                                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${currentWord.level?.startsWith('A') ? 'bg-green-50 text-green-600 border-green-100' :
                                    currentWord.level?.startsWith('B') ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                                        'bg-purple-50 text-purple-600 border-purple-100'
                                    }`}>
                                    {currentWord.level || 'A1'}
                                </span>
                                <div className="flex gap-2">
                                    <button onClick={playAudio} className="p-1.5 hover:bg-slate-100 rounded-full transition text-slate-400 hover:text-indigo-600">
                                        <Volume2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-grow flex flex-col items-center justify-center text-center mb-2">
                                <h3 className="text-3xl font-black text-slate-800 mb-1 tracking-tight">
                                    {currentWord.word}
                                </h3>
                                <p className="text-slate-400 font-serif italic text-base">/{currentWord.word.toLowerCase()}/</p>
                                <p className="text-slate-300 text-[10px] mt-3 font-bold uppercase tracking-widest">Dokun ve Çevir</p>
                            </div>

                            <div className="mt-auto flex justify-between items-center text-slate-400 text-xs font-medium">
                                <button onClick={handlePrev} className="p-1.5 hover:bg-slate-100 rounded-full transition"><ChevronLeft size={18} /></button>
                                <span>{currentIndex + 1} / {words.length}</span>
                                <button onClick={handleNext} className="p-1.5 hover:bg-slate-100 rounded-full transition"><ChevronRight size={18} /></button>
                            </div>
                        </div>

                        {/* Back */}
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-indigo-50 to-white rounded-2xl shadow-2xl shadow-indigo-200/40 border border-white/60 flex flex-col p-6 backface-hidden rotate-y-180 z-20 overflow-hidden">

                            {/* Feedback Overlay */}
                            {cardFeedback && (
                                <div className={`absolute inset-0 z-30 flex flex-col items-center justify-center backdrop-blur-sm animate-fade-in ${cardFeedback === 'known' ? 'bg-green-50/90' : 'bg-red-50/90'
                                    }`}>
                                    <div className={`p-4 rounded-full mb-2 ${cardFeedback === 'known' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                        }`}>
                                        {cardFeedback === 'known' ? <Check size={48} strokeWidth={3} /> : <X size={48} strokeWidth={3} />}
                                    </div>
                                    <span className={`text-xl font-black ${cardFeedback === 'known' ? 'text-green-700' : 'text-red-700'
                                        }`}>
                                        {cardFeedback === 'known' ? 'Biliyorum!' : 'Öğreniyorum'}
                                    </span>
                                </div>
                            )}

                            <div className="flex justify-between items-center mb-4">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Anlamı</span>
                                <Volume2 size={16} className="cursor-pointer text-indigo-400 hover:text-indigo-600" onClick={playAudio} />
                            </div>

                            <div className="flex-grow flex flex-col items-center justify-center text-center">
                                <h3 className="text-2xl font-bold text-slate-800 mb-3 leading-tight">
                                    {currentWord.meaning}
                                </h3>
                                {currentWord.example_en && (
                                    <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                        <p className="text-slate-500 text-xs italic leading-relaxed">&quot;{currentWord.example_en}&quot;</p>
                                    </div>
                                )}
                            </div>

                            {/* Interaction Buttons */}
                            <div className="grid grid-cols-2 gap-2 mb-3">
                                <button
                                    onClick={(e) => handleCardFeedback('unknown', e)}
                                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-red-50 text-red-600 font-bold text-xs hover:bg-red-100 transition"
                                >
                                    <XCircle size={16} /> Bilmiyorum
                                </button>
                                <button
                                    onClick={(e) => handleCardFeedback('known', e)}
                                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-green-50 text-green-600 font-bold text-xs hover:bg-green-100 transition"
                                >
                                    <CheckCircle size={16} /> Biliyorum
                                </button>
                            </div>

                            <div className="flex justify-center">
                                <button onClick={handleNext} className="text-slate-400 hover:text-indigo-600 text-xs font-medium flex items-center gap-1 transition">
                                    Sonraki Kelime <ArrowRight size={12} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* WRITE MODE */}
                {activeTab === 'write' && (
                    <div className="w-full h-full bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl shadow-indigo-200/40 border border-white/60 flex flex-col p-6">
                        <div className="text-center mb-6">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Türkçesi</span>
                            <h3 className="text-xl font-bold text-slate-800 mt-0.5">{currentWord.meaning}</h3>
                        </div>

                        <form onSubmit={checkWriteAnswer} className="flex-grow flex flex-col justify-center">
                            <input
                                type="text"
                                value={userInput}
                                onChange={(e) => { setUserInput(e.target.value); setWriteStatus('idle'); }}
                                placeholder="İngilizcesini yazın..."
                                className={`w-full p-3 text-center text-base font-bold rounded-xl border-2 outline-none transition-all ${writeStatus === 'correct' ? 'border-green-500 bg-green-50 text-green-700' :
                                    writeStatus === 'wrong' ? 'border-red-500 bg-red-50 text-red-700' :
                                        'border-slate-200 bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'
                                    }`}
                            />

                            {/* Feedback Message */}
                            <div className="h-6 mt-2 flex items-center justify-center">
                                {writeStatus === 'correct' && (
                                    <div className="bg-green-100 text-green-700 px-3 py-1 rounded-lg font-bold text-xs flex items-center gap-1 animate-fade-in-up w-full justify-center">
                                        <CheckCircle size={12} /> Harika! Doğru cevap.
                                    </div>
                                )}
                                {writeStatus === 'wrong' && (
                                    <div className="bg-red-100 text-red-700 px-3 py-1 rounded-lg font-bold text-xs flex items-center gap-1 animate-fade-in-up w-full justify-center">
                                        <XCircle size={12} /> Yanlış. Doğrusu: {currentWord.word}
                                    </div>
                                )}
                            </div>
                        </form>

                        <div className="mt-auto flex justify-between items-center gap-3">
                            <button onClick={handlePrev} className="p-1.5 hover:bg-slate-100 rounded-full transition text-slate-400"><ChevronLeft size={18} /></button>

                            {writeStatus === 'idle' ? (
                                <button
                                    onClick={checkWriteAnswer}
                                    className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition"
                                >
                                    Kontrol Et
                                </button>
                            ) : (
                                <button
                                    onClick={handleNext}
                                    className="flex-1 bg-slate-900 text-white py-2.5 rounded-xl font-bold text-sm shadow-lg hover:bg-slate-800 transition flex items-center justify-center gap-2"
                                >
                                    Sıradaki <ArrowRight size={14} />
                                </button>
                            )}

                            <button onClick={handleNext} className="p-1.5 hover:bg-slate-100 rounded-full transition text-slate-400"><ChevronRight size={18} /></button>
                        </div>
                    </div>
                )}

                {/* QUIZ MODE */}
                {activeTab === 'quiz' && (
                    <div className="w-full h-full bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl shadow-indigo-200/40 border border-white/60 flex flex-col p-6">
                        <div className="text-center mb-4">
                            <h3 className="text-2xl font-black text-slate-800 mb-0.5">{currentWord.word}</h3>
                            <p className="text-slate-400 text-[10px] font-bold uppercase">Doğru anlamı seç</p>
                        </div>

                        <div className="flex-grow space-y-2.5">
                            {quizOptions.map((opt, idx) => {
                                const isSelected = selectedQuizOption === opt;
                                const isCorrect = opt === currentWord.meaning;
                                const showCorrect = quizStatus !== 'idle' && isCorrect;
                                const showWrong = quizStatus === 'wrong' && isSelected;

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => checkQuizAnswer(opt)}
                                        disabled={quizStatus !== 'idle'}
                                        className={`w-full p-2.5 rounded-xl border-2 text-xs font-bold transition-all text-left flex items-center gap-2 ${showCorrect ? 'border-green-500 bg-green-50 text-green-700' :
                                                showWrong ? 'border-red-500 bg-red-50 text-red-700' :
                                                    quizStatus !== 'idle' ? 'opacity-50 border-slate-100 bg-slate-50' :
                                                        'border-slate-100 bg-white hover:border-indigo-200 hover:bg-indigo-50 text-slate-600'
                                            }`}
                                    >
                                        <span className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] border ${showCorrect ? 'bg-green-200 border-green-300 text-green-800' :
                                                showWrong ? 'bg-red-200 border-red-300 text-red-800' :
                                                    'bg-slate-100 border-slate-200 text-slate-500'
                                            }`}>
                                            {idx + 1}
                                        </span>
                                        <span className="flex-1 truncate">{opt}</span>
                                        {showCorrect && <CheckCircle size={14} />}
                                        {showWrong && <XCircle size={14} />}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="mt-auto flex justify-between items-center pt-3">
                            <button onClick={handlePrev} className="p-1.5 hover:bg-slate-100 rounded-full transition text-slate-400"><ChevronLeft size={18} /></button>
                            {quizStatus !== 'idle' && (
                                <button onClick={handleNext} className="text-indigo-600 font-bold text-xs hover:underline flex items-center gap-1">
                                    Sonraki <ArrowRight size={12} />
                                </button>
                            )}
                            <button onClick={handleNext} className="p-1.5 hover:bg-slate-100 rounded-full transition text-slate-400"><ChevronRight size={18} /></button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
