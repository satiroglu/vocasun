'use client';

import { useState, useEffect } from 'react';
import { BookOpen, PenTool, LayoutGrid, Trophy, RefreshCw, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useDailyWords } from '@/hooks/useDailyWords';

// Alt Bileşenler
import CardMode from './word-card/CardMode';
import WriteMode from './word-card/WriteMode';
import QuizMode from './word-card/QuizMode';

type TabMode = 'card' | 'write' | 'quiz';

interface DynamicWordCardProps {
    disableAudio?: boolean;
}

export default function DynamicWordCard({ disableAudio = false }: DynamicWordCardProps) {
    const { words, loading } = useDailyWords();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [activeTab, setActiveTab] = useState<TabMode>('card');
    const [isCompleted, setIsCompleted] = useState(false);

    const currentWord = words[currentIndex];

    // Tamamlanma Efekti
    useEffect(() => {
        if (isCompleted) {
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
            const timer = setTimeout(() => handleRestart(), 120000); // 2 dk sonra oto reset
            return () => clearTimeout(timer);
        }
    }, [isCompleted]);

    const playAudio = () => {
        if (disableAudio) return; // Audio disabled
        if (!currentWord) return;
        if (currentWord.audio_url) {
            new Audio(currentWord.audio_url).play().catch(() => { });
        } else {
            const u = new SpeechSynthesisUtterance(currentWord.word);
            u.lang = 'en-US';
            window.speechSynthesis.speak(u);
        }
    };

    const handleNext = () => {
        if (currentIndex < words.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            setIsCompleted(true);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        } else {
            setCurrentIndex(words.length - 1); // Başa döngü
        }
    };

    const handleRestart = () => {
        setIsCompleted(false);
        setCurrentIndex(0);
        setActiveTab('card');
    };

    if (loading) {
        return (
            <div className="relative w-full max-w-[320px] h-[400px] mx-auto bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl shadow-indigo-200/50 border border-white/60 flex flex-col items-center justify-center animate-pulse">
                <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                <p className="mt-4 text-indigo-400 font-medium text-xs">Günün Kelimeleri Hazırlanıyor...</p>
            </div>
        );
    }

    if (words.length === 0) return null;

    if (isCompleted) {
        return (
            <div className="relative w-full max-w-[320px] h-[400px] mx-auto bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl shadow-indigo-200/40 border border-white/60 flex flex-col items-center justify-center p-6 text-center animate-fade-in-up">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4 shadow-inner">
                    <Trophy size={32} className="text-yellow-600" />
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-2">Harika İş!</h3>
                <p className="text-slate-500 text-sm mb-6">Bugünün kelimelerini tamamladın. Yarın yeni kelimelerle görüşmek üzere!</p>
                <button onClick={handleRestart} className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-6 py-3 rounded-xl font-bold text-sm shadow-sm hover:bg-indigo-100 transition hover:scale-105 active:scale-95">
                    <RefreshCw size={18} /> Tekrar Başlat
                </button>
            </div>
        );
    }

    return (
        <div className="relative w-full max-w-[320px] mx-auto">
            {/* --- Mod Sekmeleri --- */}
            <div className="flex p-1 bg-slate-100/80 backdrop-blur-sm rounded-xl mb-3 border border-white/50 shadow-sm">
                <button onClick={() => setActiveTab('card')} className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${activeTab === 'card' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                    <BookOpen size={14} /> Kart
                </button>
                <button onClick={() => setActiveTab('write')} className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${activeTab === 'write' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                    <PenTool size={14} /> Yaz
                </button>
                <button onClick={() => setActiveTab('quiz')} className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${activeTab === 'quiz' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                    <LayoutGrid size={14} /> Test
                </button>
            </div>

            {/* --- Aktif Kart Modu --- */}
            <div className="relative h-[400px] perspective-1000 group">
                {activeTab === 'card' && (
                    <CardMode
                        word={currentWord}
                        index={currentIndex}
                        total={words.length}
                        onNext={handleNext}
                        onPrev={handlePrev}
                        playAudio={playAudio}
                    />
                )}
                {activeTab === 'write' && (
                    <WriteMode
                        word={currentWord}
                        onNext={handleNext}
                        onPrev={handlePrev}
                        playAudio={playAudio}
                    />
                )}
                {activeTab === 'quiz' && (
                    <QuizMode
                        word={currentWord}
                        allWords={words}
                        onNext={handleNext}
                        onPrev={handlePrev}
                        playAudio={playAudio}
                    />
                )}
            </div>
        </div>
    );
}