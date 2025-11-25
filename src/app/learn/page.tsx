'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { ArrowLeft, Volume2, Check, X, BookOpen, PenTool, LayoutGrid } from 'lucide-react';

type Mode = 'write' | 'choice' | 'flip';

export default function Learn() {
    const [loading, setLoading] = useState(true);
    const [mode, setMode] = useState<Mode>('write');
    const [words, setWords] = useState<any[]>([]);
    const [correctWord, setCorrectWord] = useState<any>(null);
    const [userInput, setUserInput] = useState('');
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [flipped, setFlipped] = useState(false);

    // Soru Çekme (Rastgelelik iyileştirilebilir)
    const fetchQuestion = async () => {
        setLoading(true);
        setStatus('idle');
        setUserInput('');
        setFlipped(false);

        const randomOffset = Math.floor(Math.random() * 40);
        const { data } = await supabase.from('vocabulary').select('*').range(randomOffset, randomOffset + 3);

        if (data && data.length > 0) {
            setWords(data);
            setCorrectWord(data[0]); // İlkini doğru kabul et
        }
        setLoading(false);
    };

    useEffect(() => { fetchQuestion(); }, []);

    // Ses Çalma
    const playAudio = (e?: React.MouseEvent) => {
        e?.stopPropagation(); // Kartın dönmesini engelle
        if (!correctWord) return;
        if (correctWord.audio_url) new Audio(correctWord.audio_url).play().catch(() => { });
        else {
            const u = new SpeechSynthesisUtterance(correctWord.word);
            u.lang = 'en-US';
            window.speechSynthesis.speak(u);
        }
    };

    // Doğru Cevap İşlemleri (XP Ekleme)
    const handleCorrect = async () => {
        setStatus('success');
        playAudio(); // Başarınca da çal
        const { data: { user } } = await supabase.auth.getUser();
        if (user) await supabase.rpc('increment_score', { row_id: user.id });
    };

    const checkWriting = (e: React.FormEvent) => {
        e.preventDefault();
        if (userInput.trim().toLowerCase() === correctWord.word.trim().toLowerCase()) handleCorrect();
        else setStatus('error');
    };

    const checkChoice = (selectedWord: string) => {
        if (status !== 'idle') return;
        if (selectedWord === correctWord.word) handleCorrect();
        else setStatus('error');
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-indigo-600 font-bold">Yükleniyor...</div>;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center p-4 font-sans">
            {/* Navbar */}
            <div className="w-full max-w-lg flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
                <div className="flex items-center w-full sm:w-auto">
                    <Link href="/dashboard" className="p-2 text-slate-500 hover:bg-slate-200 rounded-full"><ArrowLeft size={24} /></Link>
                </div>

                {/* Mod Seçici (Yazılı) */}
                <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200 w-full sm:w-auto">
                    <button onClick={() => setMode('write')} className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition text-sm font-bold ${mode === 'write' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`}>
                        <PenTool size={16} /> Yaz
                    </button>
                    <button onClick={() => setMode('choice')} className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition text-sm font-bold ${mode === 'choice' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`}>
                        <LayoutGrid size={16} /> Seç
                    </button>
                    <button onClick={() => setMode('flip')} className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition text-sm font-bold ${mode === 'flip' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`}>
                        <BookOpen size={16} /> Kart
                    </button>
                </div>
            </div>

            <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden min-h-[450px] flex flex-col relative">

                {/* Başlık ve Ses Butonu */}
                <div className="bg-slate-50 p-3 flex items-center justify-between border-b border-slate-100">
                    <div className="flex gap-2">
                        <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded-md">{correctWord.level}</span>
                        <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded-md">{correctWord.type}</span>
                    </div>
                    {/* Cevap verilmeden önce dinleme butonu */}
                    <button onClick={playAudio} className="p-2 bg-white border border-slate-200 rounded-full text-indigo-600 hover:bg-indigo-50 shadow-sm" title="Telaffuzu Dinle">
                        <Volume2 size={20} />
                    </button>
                </div>

                <div className="flex-grow flex flex-col items-center justify-center p-6 text-center w-full">

                    {/* MOD 1: YAZMA */}
                    {mode === 'write' && (
                        <>
                            <h2 className="text-3xl font-extrabold text-slate-800 mb-2">{correctWord.meaning}</h2>
                            <p className="text-slate-400 text-sm mb-6">İngilizcesini yaz:</p>
                            <form onSubmit={checkWriting} className="w-full relative">
                                <input
                                    value={userInput}
                                    onChange={(e) => setUserInput(e.target.value)}
                                    disabled={status === 'success'}
                                    className={`w-full text-center text-xl font-bold p-4 rounded-2xl border-2 outline-none transition ${status === 'success' ? 'border-green-500 bg-green-50' : 'border-slate-200 focus:border-indigo-500'}`}
                                    placeholder="..."
                                    autoComplete='off'
                                />
                                {status === 'idle' && <button type="submit" className="mt-4 w-full bg-slate-900 text-white py-3 rounded-xl font-bold">Kontrol Et</button>}
                            </form>
                        </>
                    )}

                    {/* MOD 2: SEÇMELİ */}
                    {mode === 'choice' && (
                        <>
                            <h2 className="text-3xl font-extrabold text-slate-800 mb-8">{correctWord.meaning}</h2>
                            <div className="grid grid-cols-2 gap-3 w-full">
                                {[...words].sort(() => Math.random() - 0.5).map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => checkChoice(item.word)}
                                        disabled={status !== 'idle'}
                                        className={`p-4 rounded-xl font-bold border-2 transition text-lg
                      ${status === 'success' && item.word === correctWord.word ? 'bg-green-500 text-white border-green-500' : ''}
                      ${status === 'error' && item.word === correctWord.word ? 'bg-green-500 text-white border-green-500' : ''} 
                      ${status === 'error' && item.word !== correctWord.word ? 'opacity-50' : ''}
                      ${status === 'idle' ? 'bg-white border-slate-100 hover:border-indigo-500 text-slate-700' : ''}
                    `}
                                    >
                                        {item.word}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}

                    {/* MOD 3: KART (FLIP) */}
                    {mode === 'flip' && (
                        <div className="w-full h-64 perspective cursor-pointer" onClick={() => setFlipped(!flipped)}>
                            <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${flipped ? 'rotate-y-180' : ''}`}>
                                {/* Ön Yüz (İngilizce + Ses İkonu) */}
                                <div className="absolute w-full h-full bg-indigo-50 rounded-2xl flex flex-col items-center justify-center backface-hidden border-2 border-indigo-100 shadow-inner">
                                    <div className="text-3xl font-bold text-indigo-900 mb-2">{correctWord.word}</div>
                                    <div className="text-sm text-indigo-400">(Çevirmek için dokun)</div>
                                </div>
                                {/* Arka Yüz (Türkçe + Örnek) */}
                                <div className="absolute w-full h-full bg-white rounded-2xl flex flex-col items-center justify-center backface-hidden rotate-y-180 border-2 border-slate-200">
                                    <div className="text-2xl font-bold text-slate-800 mb-2">{correctWord.meaning}</div>
                                    <div className="text-sm text-slate-500 italic px-4 mb-4">"{correctWord.example_en}"</div>

                                    {!status && ( // Sadece henüz cevaplanmadıysa butonları göster
                                        <div className="flex gap-2 w-full px-4">
                                            {/* Buradaki 'handleCorrect' XP kazandıracak */}
                                            <button onClick={(e) => { e.stopPropagation(); handleCorrect(); }} className="flex-1 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-bold hover:bg-green-200">Biliyorum</button>
                                            <button onClick={(e) => { e.stopPropagation(); fetchQuestion(); }} className="flex-1 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-bold hover:bg-red-200">Bilmiyorum</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- SONUÇ ALANI (Tüm modlar için) --- */}
                    {status === 'success' && (
                        <div className="mt-6 w-full animate-fade-in-up">
                            <div className="bg-green-100 text-green-800 p-3 rounded-xl mb-3 flex items-center justify-center gap-2">
                                <Check size={20} /> <b>Harika! (+10 XP)</b>
                            </div>
                            <button onClick={fetchQuestion} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition">Sonraki Soru</button>
                        </div>
                    )}

                    {status === 'error' && mode !== 'flip' && (
                        <div className="mt-6 w-full animate-fade-in-up">
                            <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-3 text-center">
                                Doğrusu: <b>{correctWord.word}</b>
                            </div>
                            <button onClick={fetchQuestion} className="w-full bg-slate-200 text-slate-700 py-3 rounded-xl font-bold">Devam Et</button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}