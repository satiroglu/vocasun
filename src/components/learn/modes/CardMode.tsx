import { useState, useEffect } from 'react';
import { Volume2 } from 'lucide-react';
import { VocabularyItem } from '@/types';

interface CardModeProps {
    currentWord: VocabularyItem;
    onAnswer: (answer: string | null, isMastered: boolean, visualCorrect: boolean) => void;
    playAudio: (overrideAccent?: 'US' | 'UK') => void;
    accentPreference?: string;
}

export default function CardMode({ currentWord, onAnswer, playAudio, accentPreference }: CardModeProps) {
    const [flipped, setFlipped] = useState(false);

    useEffect(() => {
        setFlipped(false);
    }, [currentWord]);

    return (
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
                                        ${accentPreference === 'US'
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
                                        ${accentPreference === 'UK'
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
                        <button onClick={() => onAnswer('WRONG', false, false)} className="flex-1 py-3 bg-white border-2 border-red-100 text-red-500 rounded-xl font-bold hover:bg-red-50 hover:border-red-200 transition text-sm shadow-sm">Bilmiyorum</button>
                        <button onClick={() => onAnswer('CORRECT', false, true)} className="flex-1 py-3 bg-white border-2 border-green-100 text-green-500 rounded-xl font-bold hover:bg-green-50 hover:border-green-200 transition text-sm shadow-sm">Biliyorum</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
