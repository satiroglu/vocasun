'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, Volume2, CheckCircle, Circle, ChevronLeft, ChevronRight, HelpCircle, History as HistoryIcon, Filter, BookOpen, X, ChevronDown, RotateCcw, Loader2, Sparkles, Clock, AlertTriangle } from 'lucide-react';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { useUser } from '@/hooks/useUser';
import { useHistory, useHistoryStats, useRelearnWord } from '@/hooks/useHistory';

const ITEMS_PER_PAGE = 12;

// Helper for level colors
const getLevelColor = (level: string | undefined) => {
    if (!level) return 'bg-slate-100 text-slate-600 border-slate-200';
    const l = level.toUpperCase();
    if (l.startsWith('A')) return 'bg-green-100 text-green-700 border-green-200';
    if (l.startsWith('B')) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    if (l.startsWith('C')) return 'bg-red-100 text-red-700 border-red-200';
    return 'bg-slate-100 text-slate-600 border-slate-200';
};

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const TYPES = [
    'adjective',
    'adverb',
    'auxiliary verb',
    'conjunction',
    'definite article',
    'determiner',
    'exclamation',
    'indefinite article',
    'infinitive marker',
    'linking verb',
    'modal verb',
    'noun',
    'number',
    'ordinal number',
    'preposition',
    'pronoun',
    'verb'
];

export default function History() {
    const { user } = useUser();
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [filter, setFilter] = useState<'all' | 'mastered' | 'learning'>('all');
    const [page, setPage] = useState(1);

    // Advanced Filters
    const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [showFilters, setShowFilters] = useState(false);

    // Re-learn Confirmation State
    const [confirmRelearnId, setConfirmRelearnId] = useState<number | null>(null);

    // Debounce Search Term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(1); // Reset to page 1 on search
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const { data, isLoading: loading } = useHistory(user?.id, page, filter, ITEMS_PER_PAGE, selectedTypes, selectedLevels, debouncedSearch);
    const { data: stats } = useHistoryStats(user?.id);
    const relearnMutation = useRelearnWord();

    const words = data?.items || [];
    const totalCount = data?.totalCount || 0;

    const playAudio = (e: React.MouseEvent, url: string | undefined, text: string) => {
        e.preventDefault();
        e.stopPropagation();
        if (url) new Audio(url).play().catch(() => { });
        else {
            const u = new SpeechSynthesisUtterance(text);
            u.lang = 'en-US';
            window.speechSynthesis.speak(u);
        }
    };

    const initiateRelearn = (vocabId: number) => {
        setConfirmRelearnId(vocabId);
    };

    const confirmRelearn = async () => {
        if (!user || !confirmRelearnId) return;
        try {
            await relearnMutation.mutateAsync({ userId: user.id, vocabId: confirmRelearnId });
            setConfirmRelearnId(null);
        } catch (error) {
            console.error('Error relearning word:', error);
        }
    };

    const cancelRelearn = () => {
        setConfirmRelearnId(null);
    };

    // Removed client-side filtering since we now use server-side search
    const displayWords = words;

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
            <div className="w-full max-w-5xl space-y-8 animate-pulse">
                <div className="h-24 bg-slate-200 rounded-xl"></div>
                <div className="h-32 bg-slate-200 rounded-xl"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-48 bg-slate-200 rounded-xl"></div>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans pt-20 pb-20 relative">

            {/* Confirmation Modal */}
            {confirmRelearnId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95">
                        <div className="flex items-center gap-3 text-amber-600 mb-4">
                            <div className="p-3 bg-amber-50 rounded-full">
                                <AlertTriangle size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">Emin misiniz?</h3>
                        </div>
                        <p className="text-slate-600 mb-6">
                            <span className="font-bold text-slate-900">"{words.find(w => w.vocab_id === confirmRelearnId)?.vocabulary?.word}"</span> kelimesini tekrar öğrenme listesine almak üzeresiniz. İlerlemeniz sıfırlanacak ve kelime "Çalışılıyor" listesine taşınacak.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <Button
                                variant="soft"
                                onClick={cancelRelearn}
                                className="!w-auto"
                            >
                                İptal
                            </Button>
                            <Button
                                variant="danger"
                                onClick={confirmRelearn}
                                isLoading={relearnMutation.isPending}
                                className="!w-auto flex items-center gap-2"
                            >
                                Evet, Sıfırla
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <main className="flex-grow max-w-5xl mx-auto w-full px-4 sm:px-6 space-y-8">

                {/* HEADER */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl shadow-sm border border-indigo-100">
                            <HistoryIcon size={32} />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Kelime Geçmişim</h1>
                            <p className="text-slate-500 mt-1">Öğrendiğin ve çalıştığın tüm kelimeleri buradan yönetebilirsin.</p>
                        </div>
                    </div>
                </div>

                {/* ARAMA VE FİLTRELEME */}
                <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex gap-3 mb-6">
                        <div className="relative w-full">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                <Search size={20} />
                            </div>
                            <input
                                type="text"
                                placeholder="Kelime ara..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-10 py-3 sm:py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-700 placeholder:text-slate-400"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-200 rounded-full transition"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`p-3 sm:p-4 rounded-xl border transition-all flex items-center justify-center gap-2 font-bold shrink-0 ${showFilters ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
                        >
                            <Filter size={20} />
                            <span className="hidden sm:inline">Filtrele</span>
                        </button>
                    </div>

                    {/* Advanced Filters Panel */}
                    {showFilters && (
                        <div className="mb-6 p-4 sm:p-6 bg-slate-50 rounded-xl border border-slate-100 animate-in fade-in slide-in-from-top-2">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-slate-700 text-sm">Detaylı Filtreler</h3>
                                {(selectedLevels.length > 0 || selectedTypes.length > 0) && (
                                    <button
                                        onClick={() => { setSelectedLevels([]); setSelectedTypes([]); }}
                                        className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1 bg-red-50 px-2 py-1 rounded-lg transition-colors"
                                    >
                                        <X size={14} />
                                        Filtreyi Sıfırla
                                    </button>
                                )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2"><Sparkles size={14} className="text-indigo-500" /> Seviye</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {LEVELS.map(level => (
                                            <button
                                                key={level}
                                                onClick={() => toggleLevel(level)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${selectedLevels.includes(level)
                                                    ? 'bg-indigo-50 text-indigo-600 border-indigo-200 shadow-sm'
                                                    : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-200 hover:text-indigo-600'
                                                    }`}
                                            >
                                                {level}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2"><BookOpen size={14} className="text-indigo-500" /> Kelime Tipi</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {TYPES.map(type => (
                                            <button
                                                key={type}
                                                onClick={() => toggleType(type)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border capitalize transition-all ${selectedTypes.includes(type)
                                                    ? 'bg-indigo-50 text-indigo-600 border-indigo-200 shadow-sm'
                                                    : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-200 hover:text-indigo-600'
                                                    }`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Main Filters */}
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => { setFilter('all'); setPage(1); }}
                            className={`whitespace-nowrap flex items-center gap-2 px-4 sm:px-6 py-3 rounded-xl text-sm font-bold transition-all border ${filter === 'all'
                                ? 'bg-slate-100 text-slate-700 border-slate-200 shadow-sm'
                                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                }`}
                            title="Tümü"
                        >
                            <BookOpen size={18} />
                            <span>Tümü ({stats?.total || 0})</span>
                        </button>
                        <button
                            onClick={() => { setFilter('mastered'); setPage(1); }}
                            className={`whitespace-nowrap flex items-center gap-2 px-4 sm:px-6 py-3 rounded-xl text-sm font-bold transition-all border ${filter === 'mastered'
                                ? 'bg-green-100 text-green-700 border-green-200 shadow-sm'
                                : 'bg-white text-slate-500 border-slate-200 hover:border-green-200 hover:text-green-600 hover:bg-green-50'
                                }`}
                            title="Öğrenilen"
                        >
                            <CheckCircle size={18} />
                            <span>Öğrenilen ({stats?.mastered || 0})</span>
                        </button>
                        <button
                            onClick={() => { setFilter('learning'); setPage(1); }}
                            className={`whitespace-nowrap flex items-center gap-2 px-4 sm:px-6 py-3 rounded-xl text-sm font-bold transition-all border ${filter === 'learning'
                                ? 'bg-amber-100 text-amber-700 border-amber-200 shadow-sm'
                                : 'bg-white text-slate-500 border-slate-200 hover:border-amber-200 hover:text-amber-600 hover:bg-amber-50'
                                }`}
                            title="Çalışılıyor"
                        >
                            <HelpCircle size={18} />
                            <span>Çalışılıyor ({stats?.learning || 0})</span>
                        </button>
                    </div>
                </div>

                {/* LİSTE */}
                {displayWords.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {displayWords.map((item, i) => (
                            <div key={i} className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all group relative flex flex-col h-full">

                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-start gap-3">
                                        <div className={`p-2.5 rounded-xl flex-shrink-0 shadow-sm mt-1 ${item.is_mastered ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                                            {item.is_mastered ? <CheckCircle className="w-4 h-4" /> : <HelpCircle className="w-4 h-4" />}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="font-bold text-lg text-slate-800 capitalize group-hover:text-indigo-700 transition-colors leading-tight">{item.vocabulary?.word}</h3>

                                                {/* Badges Next to Word */}
                                                {item.is_mastered && item.repetitions === 0 && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-blue-100 text-blue-700 border border-blue-200">
                                                        <CheckCircle size={10} />
                                                        Biliyorum
                                                    </span>
                                                )}
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${getLevelColor(item.vocabulary?.level)}`}>
                                                    {item.vocabulary?.level}
                                                </span>
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-slate-100 text-slate-600 border border-slate-200">
                                                    {item.vocabulary?.type}
                                                </span>
                                            </div>
                                            <p className="text-slate-500 text-sm font-medium leading-tight mt-1">{item.vocabulary?.meaning}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 shrink-0 ml-2">
                                        {/* Re-learn Button for Mastered Words */}
                                        {item.is_mastered && (
                                            <button
                                                onClick={() => initiateRelearn(item.vocab_id)}
                                                className="p-1.5 rounded-full text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition"
                                                title="Tekrar öğrenme listesine al"
                                            >
                                                <RotateCcw size={16} />
                                            </button>
                                        )}
                                        <button
                                            onClick={(e) => playAudio(e, item.vocabulary?.audio_url, item.vocabulary?.word)}
                                            className="p-1.5 rounded-full text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
                                        >
                                            <Volume2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                {/* ÖRNEK CÜMLELER */}
                                <div className="bg-slate-50/50 rounded-xl p-3 border border-slate-100 group-hover:bg-indigo-50/30 group-hover:border-indigo-100 transition-colors mt-auto">
                                    <p className="text-slate-800 mb-1.5 font-medium flex gap-2 text-sm">
                                        <span className="text-lg">🇬🇧</span>
                                        <span className="italic">"{item.vocabulary?.example_en}"</span>
                                    </p>
                                    <p className="text-slate-500 flex gap-2 text-xs">
                                        <span className="text-lg">🇹🇷</span>
                                        <span>{item.vocabulary?.example_tr}</span>
                                    </p>
                                </div>

                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 sm:py-24 bg-white rounded-xl border border-dashed border-slate-200">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 text-slate-300 shadow-sm">
                            <Search className="w-8 h-8 sm:w-10 sm:h-10" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-2">Sonuç bulunamadı</h3>
                        <p className="text-slate-500 max-w-xs mx-auto text-sm sm:text-base">Aradığınız kriterlere uygun kelime bulunmamaktadır. Filtreleri değiştirmeyi deneyin.</p>
                        <button
                            onClick={() => { setSearchTerm(''); setFilter('all'); setSelectedLevels([]); setSelectedTypes([]); }}
                            className="mt-4 sm:mt-6 px-5 py-2.5 sm:px-6 sm:py-3 bg-indigo-50 text-indigo-600 font-bold rounded-xl hover:bg-indigo-100 transition-colors text-sm sm:text-base"
                        >
                            Filtreleri Temizle
                        </button>
                    </div>
                )}

                {/* PAGINATION */}
                {totalCount > ITEMS_PER_PAGE && (
                    <div className="flex justify-center items-center gap-3 pt-4 pb-8">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="p-3 bg-white border border-slate-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 hover:border-indigo-200 hover:text-indigo-600 transition shadow-sm"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <span className="text-sm font-bold text-slate-600 bg-white px-6 py-3 rounded-xl border border-slate-200 shadow-sm">
                            Sayfa {page} / {totalPages}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="p-3 bg-white border border-slate-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 hover:border-indigo-200 hover:text-indigo-600 transition shadow-sm"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}

            </main>
        </div>
    );
}