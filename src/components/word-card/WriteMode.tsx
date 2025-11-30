import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import { VocabularyItem } from '@/types';

interface WriteModeProps {
    word: VocabularyItem;
    onNext: () => void;
    onPrev: () => void;
    playAudio: () => void;
}

export default function WriteMode({ word, onNext, onPrev, playAudio }: WriteModeProps) {
    const [input, setInput] = useState('');
    const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');

    // Kelime değişince input'u temizle
    useEffect(() => {
        setInput('');
        setStatus('idle');
    }, [word]);

    const checkAnswer = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim().toLowerCase() === word.word.toLowerCase()) {
            setStatus('correct');
            playAudio();
        } else {
            setStatus('wrong');
        }
    };

    return (
        <div className="w-full h-full bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl shadow-indigo-200/40 border border-white/60 flex flex-col p-6">
            <div className="text-center mb-6">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Türkçesi</span>
                <h3 className="text-xl font-bold text-slate-800 mt-0.5">{word.meaning}</h3>
            </div>

            <form onSubmit={checkAnswer} className="flex-grow flex flex-col justify-center">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => { setInput(e.target.value); setStatus('idle'); }}
                    placeholder="İngilizcesini yazın..."
                    className={`w-full p-3 text-center text-base font-bold rounded-xl border-2 outline-none transition-all ${status === 'correct' ? 'border-green-500 bg-green-50 text-green-700' :
                        status === 'wrong' ? 'border-red-500 bg-red-50 text-red-700' :
                            'border-slate-200 bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'
                        }`}
                />

                <div className="h-6 mt-2 flex items-center justify-center">
                    {status === 'correct' && (
                        <div className="bg-green-100 text-green-700 px-3 py-1 rounded-lg font-bold text-xs flex items-center gap-1 animate-fade-in-up w-full justify-center">
                            <CheckCircle size={12} /> Harika! Doğru cevap.
                        </div>
                    )}
                    {status === 'wrong' && (
                        <div className="bg-red-100 text-red-700 px-3 py-1 rounded-lg font-bold text-xs flex items-center gap-1 animate-fade-in-up w-full justify-center">
                            <XCircle size={12} /> Yanlış. Doğrusu: {word.word}
                        </div>
                    )}
                </div>
            </form>

            <div className="mt-auto flex justify-between items-center gap-3">
                <button onClick={onPrev} className="p-1.5 hover:bg-slate-100 rounded-full transition text-slate-400"><ChevronLeft size={18} /></button>

                {status === 'idle' ? (
                    <button
                        onClick={checkAnswer}
                        className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition"
                    >
                        Kontrol Et
                    </button>
                ) : (
                    <button
                        onClick={onNext}
                        className="flex-1 bg-slate-900 text-white py-2.5 rounded-xl font-bold text-sm shadow-lg hover:bg-slate-800 transition flex items-center justify-center gap-2"
                    >
                        Sıradaki <ArrowRight size={14} />
                    </button>
                )}

                <button onClick={onNext} className="p-1.5 hover:bg-slate-100 rounded-full transition text-slate-400"><ChevronRight size={18} /></button>
            </div>
        </div>
    );
}