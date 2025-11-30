import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import { VocabularyItem } from '@/types';

interface QuizModeProps {
    word: VocabularyItem;
    allWords: VocabularyItem[]; // Şık üretmek için diğer kelimeler lazım
    onNext: () => void;
    onPrev: () => void;
    playAudio: () => void;
}

export default function QuizMode({ word, allWords, onNext, onPrev, playAudio }: QuizModeProps) {
    const [options, setOptions] = useState<string[]>([]);
    const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
    const [selected, setSelected] = useState<string | null>(null);

    useEffect(() => {
        // Kelime değişince şıkları ve durumu sıfırla
        setStatus('idle');
        setSelected(null);

        if (!word || allWords.length < 2) return;

        // Şık Üretme Mantığı
        const others = allWords.filter(w => w.id !== word.id);
        const shuffled = [...others].sort(() => Math.random() - 0.5).slice(0, 3);
        const newOptions = [word.meaning, ...shuffled.map(w => w.meaning)].sort(() => Math.random() - 0.5);

        setOptions(newOptions);
    }, [word, allWords]);

    const handleSelect = (option: string) => {
        if (status !== 'idle') return; // Zaten cevaplandıysa engelle

        setSelected(option);
        if (option === word.meaning) {
            setStatus('correct');
            playAudio();
        } else {
            setStatus('wrong');
        }
    };

    return (
        <div className="w-full h-full bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl shadow-indigo-200/40 border border-white/60 flex flex-col p-6">
            <div className="text-center mb-4">
                <h3 className="text-2xl font-black text-slate-800 mb-0.5">{word.word}</h3>
                <p className="text-slate-400 text-[10px] font-bold uppercase">Doğru anlamı seç</p>
            </div>

            <div className="flex-grow space-y-2.5">
                {options.map((opt, idx) => {
                    const isSelected = selected === opt;
                    const isCorrect = opt === word.meaning;

                    // Gösterim Durumları
                    const showCorrect = status !== 'idle' && isCorrect; // Cevaplandıysa doğruyu yeşil yak
                    const showWrong = status === 'wrong' && isSelected; // Yanlış seçildiyse kırmız yak

                    return (
                        <button
                            key={idx}
                            onClick={() => handleSelect(opt)}
                            disabled={status !== 'idle'}
                            className={`w-full p-2.5 rounded-xl border-2 text-xs font-bold transition-all text-left flex items-center gap-2 ${showCorrect ? 'border-green-500 bg-green-50 text-green-700' :
                                    showWrong ? 'border-red-500 bg-red-50 text-red-700' :
                                        status !== 'idle' ? 'opacity-50 border-slate-100 bg-slate-50' : // Cevaplandı ama bu şık seçilmedi
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
                <button onClick={onPrev} className="p-1.5 hover:bg-slate-100 rounded-full transition text-slate-400"><ChevronLeft size={18} /></button>
                {status !== 'idle' && (
                    <button onClick={onNext} className="text-indigo-600 font-bold text-xs hover:underline flex items-center gap-1 animate-fade-in">
                        Sonraki <ArrowRight size={12} />
                    </button>
                )}
                <button onClick={onNext} className="p-1.5 hover:bg-slate-100 rounded-full transition text-slate-400"><ChevronRight size={18} /></button>
            </div>
        </div>
    );
}