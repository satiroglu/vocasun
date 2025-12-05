import { Sparkles, Clock } from 'lucide-react';
import { VocabularyItem } from '@/types';

interface WordBadgesProps {
    currentWord: VocabularyItem;
    isNew: boolean;
    small?: boolean;
}

export default function WordBadges({ currentWord, isNew, small = false }: WordBadgesProps) {
    const getLevelColor = (level: string | undefined) => {
        if (!level) return 'bg-slate-100 text-slate-600 border-slate-200';
        const l = level.toLowerCase();
        if (l.startsWith('a')) return 'bg-green-100 text-green-700 border-green-200';
        if (l.startsWith('b')) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        if (l.startsWith('c')) return 'bg-red-100 text-red-700 border-red-200';
        return 'bg-slate-100 text-slate-600 border-slate-200';
    };

    return (
        <div className={`flex flex-wrap items-center justify-center ${small ? 'gap-1.5' : 'gap-2'}`}>
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
}
