import { useState, useRef, useEffect } from 'react';
import { Lightbulb, SkipForward } from 'lucide-react';
import { VocabularyItem } from '@/types';
import { getEditDistance } from '@/lib/utils';

interface WriteModeProps {
    currentWord: VocabularyItem;
    onAnswer: (answer: string | null, isMastered: boolean, visualCorrect: boolean) => void;
    setFeedbackMsg: (msg: { type: 'warning' | 'info', text: string } | null) => void;
}

export default function WriteMode({ currentWord, onAnswer, setFeedbackMsg }: WriteModeProps) {
    const [userInput, setUserInput] = useState('');
    const [hintLevel, setHintLevel] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setUserInput('');
        setHintLevel(0);
        setTimeout(() => inputRef.current?.focus(), 100);
    }, [currentWord]);

    const showHint = () => {
        setHintLevel(prev => Math.min(prev + 1, 1));
        if (inputRef.current) inputRef.current.blur();
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

        onAnswer(input, false, isVisuallyCorrect);
    };

    return (
        <>
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
                        <button type="button" onClick={() => onAnswer('SKIP', false, false)} className="flex-1 py-3.5 bg-white border-2 border-slate-100 text-slate-500 font-bold rounded-xl hover:bg-slate-50 hover:text-slate-700 transition flex items-center justify-center gap-2 text-sm">
                            <SkipForward size={18} /> Bilmiyorum
                        </button>
                        <button type="submit" className="flex-[2] py-3.5 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 active:scale-[0.98] transition hover:bg-indigo-700 flex items-center justify-center gap-2 text-sm">
                            Kontrol Et
                        </button>
                    </div>
                </form>
            </div>

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
        </>
    );
}
