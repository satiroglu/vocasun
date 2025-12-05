import { useEffect, useMemo } from 'react';
import { VocabularyItem } from '@/types';
import { useChoiceOptions } from '@/hooks/useLearnSession';

interface ChoiceModeProps {
    currentWord: VocabularyItem;
    onAnswer: (answer: string | null, isMastered: boolean, visualCorrect: boolean) => void;
    disabled?: boolean;
}

export default function ChoiceMode({ currentWord, onAnswer, disabled }: ChoiceModeProps) {
    const { data: choiceOptions = [], isLoading: isOptionsLoading } = useChoiceOptions(currentWord?.id);

    const options = useMemo(() => {
        if (!currentWord) return [];
        return [currentWord, ...choiceOptions].sort(() => Math.random() - 0.5);
    }, [currentWord, choiceOptions]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (disabled) return;

            if (options.length > 0) {
                if (['1', '2', '3', '4'].includes(e.key)) {
                    const index = parseInt(e.key) - 1;
                    if (options[index]) {
                        const selectedOption = options[index];
                        onAnswer(selectedOption.word, false, selectedOption.id === currentWord?.id);
                    }
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [options, currentWord, onAnswer, disabled]);

    return (
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
                        onClick={() => !disabled && onAnswer(opt.word, false, opt.id === currentWord.id)}
                        disabled={disabled}
                        className="w-full p-3 bg-white border-2 border-slate-100 rounded-xl font-bold text-slate-700 text-base hover:border-indigo-500 hover:ring-2 hover:ring-indigo-500/10 active:scale-[0.98] transition-all flex items-center gap-3 group text-left shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className="w-8 h-8 rounded-lg bg-slate-50 text-slate-500 border border-slate-200 flex items-center justify-center text-xs font-bold group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-colors shrink-0">
                            {idx + 1}
                        </span>
                        <span className="truncate">{opt.word}</span>
                    </button>
                ))
            )}
        </div>
    );
}
