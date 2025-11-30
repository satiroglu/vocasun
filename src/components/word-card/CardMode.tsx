import { useState } from 'react';
import { Volume2, ChevronLeft, ChevronRight, Check, X, ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import { VocabularyItem } from '@/types';

interface CardModeProps {
    word: VocabularyItem;
    index: number;
    total: number;
    onNext: () => void;
    onPrev: () => void;
    playAudio: () => void;
}

export default function CardMode({ word, index, total, onNext, onPrev, playAudio }: CardModeProps) {
    const [flipped, setFlipped] = useState(false);
    const [feedback, setFeedback] = useState<'known' | 'unknown' | null>(null);

    const handleFeedback = (status: 'known' | 'unknown', e: React.MouseEvent) => {
        e.stopPropagation();
        setFeedback(status);
        setTimeout(() => {
            setFeedback(null);
            setFlipped(false); // Yeni karta geçerken düzelt
            onNext();
        }, 800);
    };

    return (
        <div className={`relative w-full h-full transition-all duration-700 transform-style-3d ${flipped ? 'rotate-y-180' : ''}`}>
            {/* --- ÖN YÜZ --- */}
            <div
                className="absolute inset-0 w-full h-full bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl shadow-indigo-200/40 border border-white/60 flex flex-col p-6 backface-hidden z-10 cursor-pointer"
                onClick={() => setFlipped(true)}
            >
                <div className="flex justify-between items-center mb-4">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${word.level?.startsWith('A') ? 'bg-green-50 text-green-600 border-green-100' :
                        word.level?.startsWith('B') ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                            'bg-purple-50 text-purple-600 border-purple-100'
                        }`}>
                        {word.level || 'A1'}
                    </span>
                    <button onClick={(e) => { e.stopPropagation(); playAudio(); }} className="p-1.5 hover:bg-slate-100 rounded-full transition text-slate-400 hover:text-indigo-600">
                        <Volume2 size={16} />
                    </button>
                </div>

                <div className="flex-grow flex flex-col items-center justify-center text-center mb-2">
                    <h3 className="text-3xl font-black text-slate-800 mb-1 tracking-tight">{word.word}</h3>
                    <p className="text-slate-400 font-serif italic text-base">/{word.word.toLowerCase()}/</p>
                    <p className="text-slate-300 text-[10px] mt-3 font-bold uppercase tracking-widest">Dokun ve Çevir</p>
                </div>

                <div className="mt-auto flex justify-between items-center text-slate-400 text-xs font-medium">
                    <button onClick={(e) => { e.stopPropagation(); onPrev(); }} className="p-1.5 hover:bg-slate-100 rounded-full transition"><ChevronLeft size={18} /></button>
                    <span>{index + 1} / {total}</span>
                    <button onClick={(e) => { e.stopPropagation(); onNext(); }} className="p-1.5 hover:bg-slate-100 rounded-full transition"><ChevronRight size={18} /></button>
                </div>
            </div>

            {/* --- ARKA YÜZ --- */}
            <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-indigo-50 to-white rounded-2xl shadow-2xl shadow-indigo-200/40 border border-white/60 flex flex-col p-6 backface-hidden rotate-y-180 z-20 overflow-hidden">

                {/* Feedback Overlay */}
                {feedback && (
                    <div className={`absolute inset-0 z-30 flex flex-col items-center justify-center backdrop-blur-sm animate-fade-in ${feedback === 'known' ? 'bg-green-50/90' : 'bg-red-50/90'}`}>
                        <div className={`p-4 rounded-full mb-2 ${feedback === 'known' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                            {feedback === 'known' ? <Check size={48} strokeWidth={3} /> : <X size={48} strokeWidth={3} />}
                        </div>
                        <span className={`text-xl font-black ${feedback === 'known' ? 'text-green-700' : 'text-red-700'}`}>
                            {feedback === 'known' ? 'Biliyorum!' : 'Öğreniyorum'}
                        </span>
                    </div>
                )}

                <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Anlamı</span>
                    <Volume2 size={16} className="cursor-pointer text-indigo-400 hover:text-indigo-600" onClick={(e) => { e.stopPropagation(); playAudio(); }} />
                </div>

                <div className="flex-grow flex flex-col items-center justify-center text-center">
                    <h3 className="text-2xl font-bold text-slate-800 mb-3 leading-tight">{word.meaning}</h3>
                    {word.example_en && (
                        <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                            <p className="text-slate-500 text-xs italic leading-relaxed">&quot;{word.example_en}&quot;</p>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3">
                    <button onClick={(e) => handleFeedback('unknown', e)} className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-red-50 text-red-600 font-bold text-xs hover:bg-red-100 transition">
                        <XCircle size={16} /> Bilmiyorum
                    </button>
                    <button onClick={(e) => handleFeedback('known', e)} className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-green-50 text-green-600 font-bold text-xs hover:bg-green-100 transition">
                        <CheckCircle size={16} /> Biliyorum
                    </button>
                </div>

                <div className="flex justify-center">
                    <button onClick={(e) => { e.stopPropagation(); onNext(); }} className="text-slate-400 hover:text-indigo-600 text-xs font-medium flex items-center gap-1 transition">
                        Sonraki Kelime <ArrowRight size={12} />
                    </button>
                </div>
            </div>
        </div>
    );
}