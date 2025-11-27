'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, Volume2, CheckCircle, Circle, ChevronLeft, ChevronRight, HelpCircle, History as HistoryIcon, Filter, BookOpen, X, ChevronDown } from 'lucide-react';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { useUser } from '@/hooks/useUser';
import { useHistory } from '@/hooks/useHistory';

const ITEMS_PER_PAGE = 10;

// Helper for level colors
const getLevelColor = (level: string | undefined) => {
    if (!level) return 'bg-slate-100 text-slate-500 border-slate-200';
    const l = level.toUpperCase();
    if (l.startsWith('A')) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (l.startsWith('B')) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    if (l.startsWith('C')) return 'bg-rose-100 text-rose-700 border-rose-200';
    return 'bg-slate-100 text-slate-500 border-slate-200';
};

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const TYPES = ['noun', 'verb', 'adjective', 'adverb', 'phrase', 'idiom'];

export default function History() {
    const { user } = useUser();
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<'all' | 'mastered' | 'learning'>('all');
    const [page, setPage] = useState(1);

    // Advanced Filters
    const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [showFilters, setShowFilters] = useState(false);

    const { data, isLoading: loading } = useHistory(user?.id, page, filter, ITEMS_PER_PAGE, selectedTypes, selectedLevels);

    const words = data?.items || [];
    const totalCount = data?.totalCount || 0;

    const playAudio = (url: string | undefined, text: string) => { // url undefined olabilir
        if (url) new Audio(url).play().catch(() => { });
        else {
            const u = new SpeechSynthesisUtterance(text);
            u.lang = 'en-US';
            window.speechSynthesis.speak(u);
        }
    };

    const displayWords = words.filter(item => {
        if (!searchTerm) return true;
        return item.vocabulary?.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.vocabulary?.meaning.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    const toggleLevel = (level: string) => {
        setPage(1);
        setSelectedLevels(prev =>
            prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]
        );
    };

    const toggleType = (type: string) => {
        setPage(1);
        setSelectedTypes(prev =>
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
        );
    };

    // Skeleton Loading
    if (loading) return (
        <div className="min-h-screen flex flex-col items-center pt-24 px-4 bg-slate-50">
            <div className="w-full max-w-3xl space-y-6 animate-pulse">
                <div className="h-20 bg-slate-200 rounded-xl"></div>
                <div className="h-32 bg-slate-200 rounded-xl"></div>
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-40 bg-slate-200 rounded-xl"></div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 px-4 pt-20 pb-20 font-sans flex flex-col items-center">
            <div className="w-full max-w-3xl space-y-6">

                {/* HEADER */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl shadow-sm border border-indigo-100">
                            <HistoryIcon size={28} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Kelime Geçmişim</h1>
                            <p className="text-slate-500">Öğrendiğin tüm kelimeler burada.</p>
                        </div>
                    </div>
                </div>

                {/* ARAMA VE FİLTRELEME */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex gap-4 mb-6">
                        <div className="relative w-full">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                <Search size={20} />
                            </div>
                            <input
                                type="text"
                                placeholder="Kelime veya anlam ara..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-700 placeholder:text-slate-400"
                            />
                            {/* Clear Button */}
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-200 rounded-full transition"
                                >
                                    <X size={18} />
                                </button>
                            )}
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`p-4 rounded-xl border transition-all flex items-center gap-2 ${showFilters ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                        >
                            <Filter size={20} />
                        </button>
                    </div>

                    {/* Advanced Filters Panel */}
                    {showFilters && (
                        <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100 animate-in fade-in slide-in-from-top-2">
                            <div className="mb-4">
                                <h4 className="text-sm font-bold text-slate-700 mb-2">Seviye</h4>
                                <div className="flex flex-wrap gap-2">
                                    {LEVELS.map(level => (
                                        <button
                                            key={level}
                                            onClick={() => toggleLevel(level)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${selectedLevels.includes(level)
                                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                                    : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-200 hover:text-indigo-600'
                                                }`}
                                        >
                                            {level}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-700 mb-2">Kelime Tipi</h4>
                                <div className="flex flex-wrap gap-2">
                                    {TYPES.map(type => (
                                        <button
                                            key={type}
                                            onClick={() => toggleType(type)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border capitalize transition-all ${selectedTypes.includes(type)
                                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                                    : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-200 hover:text-indigo-600'
                                                }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Main Filters: overflow-x-auto, no-scrollbar, rounded-lg */}
                    <div className="flex gap-2 overflow-x-auto pb-2 -mb-2 scrollbar-hide">
                        <button
                            onClick={() => { setFilter('all'); setPage(1); }}
                            className={`whitespace-nowrap px-5 py-2.5 rounded-lg text-sm font-bold transition-all border ${filter === 'all'
                                    ? 'bg-slate-100 text-slate-700 border-slate-200 shadow-sm transform scale-105'
                                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                }`}
                        >
                            Tümü ({totalCount})
                        </button>
                        <button
                            onClick={() => { setFilter('mastered'); setPage(1); }}
                            className={`whitespace-nowrap flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all border ${filter === 'mastered'
                                    ? 'bg-green-100 text-green-700 border-green-200 shadow-sm transform scale-105'
                                    : 'bg-white text-slate-500 border-slate-200 hover:border-green-200 hover:text-green-600 hover:bg-green-50'
                                }`}
                        >
                            <CheckCircle size={16} /> Öğrenilen
                        </button>
                        <button
                            onClick={() => { setFilter('learning'); setPage(1); }}
                            className={`whitespace-nowrap flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all border ${filter === 'learning'
                                    ? 'bg-amber-100 text-amber-700 border-amber-200 shadow-sm transform scale-105'
                                    : 'bg-white text-slate-500 border-slate-200 hover:border-amber-200 hover:text-amber-600 hover:bg-amber-50'
                                }`}
                        >
                            <HelpCircle size={16} /> Çalışılıyor
                        </button>
                    </div>
                </div>

                {/* LİSTE */}
                {displayWords.length > 0 ? (
                    <div className="space-y-4">
                        {displayWords.map((item, i) => (
                            <div key={i} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all group">

                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2.5 rounded-xl flex-shrink-0 ${item.is_mastered ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                                            {item.is_mastered ? <CheckCircle className="w-4 h-4 md:w-5 md:h-5" /> : <HelpCircle className="w-4 h-4 md:w-5 md:h-5" />}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 flex-wrap mb-1">
                                                <h3 className="font-bold text-base md:text-lg text-slate-800 capitalize group-hover:text-indigo-700 transition-colors">{item.vocabulary?.word}</h3>
                                                {/* Level Badge */}
                                                <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-lg border ${getLevelColor(item.vocabulary?.level)}`}>
                                                    {item.vocabulary?.level}
                                                </span>
                                                {/* Type Badge */}
                                                <span className="text-[10px] uppercase tracking-wider font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-lg border border-slate-200">{item.vocabulary?.type}</span>
                                            </div>
                                            <p className="text-slate-600 font-medium text-sm md:text-base">{item.vocabulary?.meaning}</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => playAudio(item.vocabulary?.audio_url, item.vocabulary?.word)}
                                        className="p-3 bg-slate-50 text-indigo-600 rounded-full hover:bg-indigo-600 hover:text-white transition-all shadow-sm active:scale-90"
                                    >
                                        <Volume2 size={20} />
                                    </button>
                                </div>

                                {/* ÖRNEK CÜMLELER */}
                                <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-100 group-hover:bg-indigo-50/30 group-hover:border-indigo-100 transition-colors">
                                    <p className="text-slate-800 mb-2 font-medium flex gap-2 text-sm md:text-base">
                                        <span className="text-lg">🇬🇧</span>
                                        <span className="italic">"{item.vocabulary?.example_en}"</span>
                                    </p>
                                    <p className="text-slate-500 flex gap-2 text-sm md:text-base">
                                        <span className="text-lg">🇹🇷</span>
                                        <span>{item.vocabulary?.example_tr}</span>
                                    </p>
                                </div>

                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-200">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                            <Search size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-700 mb-2">Sonuç bulunamadı</h3>
                        <p className="text-slate-500">Aradığınız kriterlere uygun kelime yok.</p>
                    </div>
                )}

                {/* PAGINATION */}
                {totalCount > ITEMS_PER_PAGE && (
                    <div className="flex justify-center items-center gap-3 pt-4 pb-8">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="p-2.5 bg-white border border-slate-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 hover:border-indigo-200 hover:text-indigo-600 transition shadow-sm"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <span className="text-sm font-bold text-slate-600 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm">
                            Sayfa {page} / {totalPages}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="p-2.5 bg-white border border-slate-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 hover:border-indigo-200 hover:text-indigo-600 transition shadow-sm"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}