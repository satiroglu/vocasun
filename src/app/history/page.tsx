'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { ArrowLeft, Search, Volume2, CheckCircle, Circle, ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react';

const ITEMS_PER_PAGE = 10;

export default function History() {
    const [words, setWords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<'all' | 'mastered' | 'learning'>('all');

    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    const fetchHistory = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        let query = supabase
            .from('user_progress')
            .select(`
        updated_at,
        is_mastered,
        vocabulary ( word, meaning, audio_url, type, example_en, example_tr )
      `, { count: 'exact' })
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false });

        if (filter === 'mastered') query = query.eq('is_mastered', true);
        if (filter === 'learning') query = query.eq('is_mastered', false);

        const from = (page - 1) * ITEMS_PER_PAGE;
        const to = from + ITEMS_PER_PAGE - 1;

        const { data, count } = await query.range(from, to);

        if (data) setWords(data);
        if (count) setTotalCount(count);
        setLoading(false);
    };

    useEffect(() => {
        fetchHistory();
    }, [page, filter]);

    const playAudio = (url: string, text: string) => {
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

    return (
        <div className="min-h-screen bg-slate-50 p-4 font-sans flex flex-col items-center">
            <div className="w-full max-w-3xl">

                <div className="flex items-center gap-4 mb-6 mt-2">
                    <Link href="/dashboard" className="p-2 bg-white rounded-xl shadow-sm border border-slate-200 text-slate-500 hover:text-indigo-600 transition"><ArrowLeft size={24} /></Link>
                    <h1 className="text-2xl font-bold text-slate-800">Kelime Geçmişim</h1>
                </div>

                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 flex flex-col gap-4">
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Kelime ara..."
                            className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-1">
                        <button onClick={() => { setFilter('all'); setPage(1); }} className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-bold transition ${filter === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Tümü ({totalCount})</button>
                        <button onClick={() => { setFilter('mastered'); setPage(1); }} className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-bold transition ${filter === 'mastered' ? 'bg-green-600 text-white' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}>Öğrenilen</button>
                        <button onClick={() => { setFilter('learning'); setPage(1); }} className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-bold transition ${filter === 'learning' ? 'bg-yellow-500 text-white' : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'}`}>Çalışılıyor</button>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-10 text-slate-500">Yükleniyor...</div>
                ) : displayWords.length > 0 ? (
                    <div className="space-y-4">
                        {displayWords.map((item, i) => (
                            <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition group">

                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-4">
                                        <div className={`mt-1 p-2 rounded-full flex-shrink-0 ${item.is_mastered ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                            {/* is_mastered: false ise 'HelpCircle' ikonu ile 'Bilmiyorum/Çalışılıyor' vurgusu */}
                                            {item.is_mastered ? <CheckCircle size={20} /> : <HelpCircle size={20} />}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="font-bold text-xl text-slate-800 capitalize">{item.vocabulary?.word}</h3>
                                                <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200">{item.vocabulary?.type}</span>
                                            </div>
                                            <p className="text-slate-600 font-medium">{item.vocabulary?.meaning}</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => playAudio(item.vocabulary?.audio_url, item.vocabulary?.word)}
                                        className="p-2 bg-slate-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition"
                                    >
                                        <Volume2 size={20} />
                                    </button>
                                </div>

                                {/* BAYRAKLI ÖRNEK CÜMLELER */}
                                <div className="bg-slate-50 rounded-xl p-3 text-sm">
                                    <p className="text-slate-700 mb-1">🇬🇧 <i>{item.vocabulary?.example_en}</i></p>
                                    <p className="text-slate-500">🇹🇷 {item.vocabulary?.example_tr}</p>
                                </div>

                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 text-slate-400">
                        Kayıt bulunamadı.
                    </div>
                )}

                {totalCount > ITEMS_PER_PAGE && (
                    <div className="flex justify-center items-center gap-4 mt-8 pb-8">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="p-3 bg-white border border-slate-200 rounded-xl disabled:opacity-50 hover:bg-slate-50 transition"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <span className="font-bold text-slate-600">
                            Sayfa {page} / {totalPages}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="p-3 bg-white border border-slate-200 rounded-xl disabled:opacity-50 hover:bg-slate-50 transition"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}