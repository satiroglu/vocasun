import { Check, X, Volume2 } from 'lucide-react';
import { VocabularyItem } from '@/types';
import WordBadges from './WordBadges';

interface LearnResultProps {
    status: 'success' | 'error';
    currentWord: VocabularyItem;
    isNew: boolean;
    playAudio: (overrideAccent?: 'US' | 'UK') => void;
    accentPreference?: string;
    onNext: () => void;
    feedbackMsg: { type: 'warning' | 'info', text: string } | null;
}

export default function LearnResult({ status, currentWord, isNew, playAudio, accentPreference, onNext, feedbackMsg }: LearnResultProps) {
    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex flex-col items-center justify-center z-[60] animate-fade-in p-4 sm:p-6">
            <div className={`p-4 sm:p-8 rounded-xl shadow-2xl w-full max-w-sm text-center animate-scale-up bg-white relative overflow-hidden`}>
                <div className={`absolute top-0 left-0 w-full h-2 ${status === 'success' ? 'bg-green-500' : 'bg-red-500'}`}></div>

                <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg ${status === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {status === 'success' ? <Check size={32} strokeWidth={4} className="sm:w-10 sm:h-10" /> : <X size={32} strokeWidth={4} className="sm:w-10 sm:h-10" />}
                </div>

                <h3 className={`text-xl sm:text-2xl font-black mb-3 sm:mb-4 px-2 ${status === 'success' ? 'text-slate-800' : 'text-slate-800'}`}>
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

                <div className="bg-slate-50 rounded-xl p-4 sm:p-5 pt-8 border border-slate-100 mb-4 sm:mb-6 relative mt-4 sm:mt-6">
                    <div className="absolute -top-3 left-0 w-full flex justify-center px-4">
                        <WordBadges currentWord={currentWord} isNew={isNew} small />
                    </div>

                    <div className="text-2xl sm:text-3xl font-bold text-slate-800 flex items-center justify-center gap-2 mb-2 mt-4 break-words px-2">
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

                    <p className="text-xs sm:text-sm text-slate-500 italic mt-2 break-words">"{currentWord.example_en}"</p>
                    <div className="mt-3 h-px w-full bg-slate-200"></div>
                    <p className="text-xs sm:text-sm text-slate-400 mt-2 break-words">{currentWord.example_tr}</p>
                </div>
                <button
                    onClick={onNext}
                    autoFocus
                    className={`w-full py-4 rounded-xl font-bold text-white text-lg shadow-xl transition active:scale-95 flex items-center justify-center gap-2 ${status === 'success' ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200' : 'bg-slate-800 hover:bg-slate-900 shadow-slate-300'}`}
                >
                    Devam Et <span className="opacity-50 text-xs font-normal">(Enter)</span>
                </button>
            </div>
        </div>
    );
}
