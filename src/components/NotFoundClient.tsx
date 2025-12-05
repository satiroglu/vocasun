'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/Button';
import { Home, BookOpen, RefreshCw, Sparkles, Map, Search } from 'lucide-react';

// "Kaybolmak" ve "Keşfetmek" temalı kelimeler
const LOST_WORDS = [
    {
        word: "Serendipity",
        pronunciation: "/ˌser.ənˈdɪp.ə.ti/",
        meaning: "Mutlu tesadüf",
        description: "Aranmayan bir şeyi şans eseri bulma yeteneği veya olayı.",
        example: "Finding this cafe was pure serendipity."
    },
    {
        word: "Wanderlust",
        pronunciation: "/ˈwɒn.də.lʌst/",
        meaning: "Gezme tutkusu",
        description: "Dünyayı dolaşma ve seyahat etme konusunda duyulan güçlü istek.",
        example: "Her wanderlust took her to every continent."
    },
    {
        word: "Labyrinth",
        pronunciation: "/ˈlæb.ə.rɪnθ/",
        meaning: "Labirent",
        description: "İçinden çıkılması zor, karmaşık yollar bütünü.",
        example: "The old city was a labyrinth of narrow streets."
    },
    {
        word: "Epiphany",
        pronunciation: "/ɪˈpɪf.ən.i/",
        meaning: "Aydınlanma anı",
        description: "Bir şeyin anlamını veya özünü aniden kavrama, fark etme.",
        example: "She had an epiphany about her career path."
    },
    {
        word: "Obscure",
        pronunciation: "/əbˈskjʊər/",
        meaning: "Belirsiz / Gizli",
        description: "Bilinmeyen, anlaşılması güç veya gözden uzak olan.",
        example: "The origins of this tradition are obscure."
    }
];

export default function NotFoundClient() {
    const [randomWord, setRandomWord] = useState(LOST_WORDS[0]);
    const [isHovering, setIsHovering] = useState(false);

    // Sayfa yüklendiğinde rastgele bir kelime seç
    useEffect(() => {
        setRandomWord(LOST_WORDS[Math.floor(Math.random() * LOST_WORDS.length)]);
    }, []);

    const handleNewWord = () => {
        let newWord;
        do {
            newWord = LOST_WORDS[Math.floor(Math.random() * LOST_WORDS.length)];
        } while (newWord.word === randomWord.word);
        setRandomWord(newWord);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden selection:bg-indigo-100 selection:text-indigo-700 py-12 sm:py-0">
            {/* Navbar'ı gizlemek için Global Style */}
            <style jsx global>{`
        nav {
          display: none !important;
        }
      `}</style>

            {/* Arkaplan Dekorasyonları */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                        rotate: [0, 90, 0]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] bg-indigo-200/20 rounded-full blur-[100px]"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.3, 0.4, 0.3],
                        rotate: [0, -60, 0]
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] bg-amber-100/40 rounded-full blur-[100px]"
                />

                {/* Yüzen Harfler/Semboller */}
                <FloatingElement delay={0} x="10%" y="20%">?</FloatingElement>
                <FloatingElement delay={2} x="80%" y="15%">404</FloatingElement>
                <FloatingElement delay={4} x="15%" y="70%">!</FloatingElement>
                <FloatingElement delay={1} x="85%" y="80%">#</FloatingElement>
            </div>

            <div className="container max-w-6xl mx-auto px-4 relative z-10 grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">

                {/* SOL: 404 Mesajı ve Aksiyonlar */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-center lg:text-left space-y-8"
                >
                    <div className="relative inline-block">
                        <motion.h1
                            className="text-[100px] sm:text-[180px] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 via-violet-600 to-amber-500"
                            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                            style={{ backgroundSize: "200% 200%" }}
                        >
                            404
                        </motion.h1>
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.5, type: "spring" }}
                            className="absolute -top-4 -right-4 sm:top-4 sm:right-0 bg-white shadow-xl rounded-full p-3 rotate-12 border border-slate-100"
                        >
                            <Map size={32} className="text-amber-500" />
                        </motion.div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
                            Yolunu mu kaybettin?
                        </h2>
                        <p className="text-lg text-slate-600 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                            Aradığın sayfa kelime okyanusumuzun derinliklerinde kaybolmuş gibi görünüyor.
                            Ama endişelenme, her kayboluş yeni bir keşfin başlangıcıdır.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                        <Link href="/">
                            <Button variant="primary" icon={<Home size={20} />} className="w-full sm:w-auto h-12 px-8 text-lg">
                                Ana Sayfa
                            </Button>
                        </Link>
                        <Link href="/learn">
                            <Button variant="outline" icon={<BookOpen size={20} />} className="w-full sm:w-auto h-12 px-8 text-lg bg-white/50 backdrop-blur-sm hover:bg-white">
                                Öğrenmeye Başla
                            </Button>
                        </Link>
                    </div>
                </motion.div>

                {/* SAĞ: İnteraktif Kelime Kartı */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className="relative w-full max-w-md lg:max-w-none mx-auto"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-[2rem] rotate-6 opacity-20 blur-xl transform scale-95" />

                    <motion.div
                        className="bg-white rounded-[2rem] shadow-2xl border border-slate-100 p-6 sm:p-8 relative overflow-hidden group"
                        whileHover={{ y: -5 }}
                        onHoverStart={() => setIsHovering(true)}
                        onHoverEnd={() => setIsHovering(false)}
                    >
                        {/* Kart Arkaplan Deseni */}
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                            <Search size={120} />
                        </div>

                        <div className="relative z-10 space-y-6">
                            <div className="flex justify-between items-start">
                                <div className="bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2">
                                    <Sparkles size={16} />
                                    Günün Kelimesi
                                </div>
                                <button
                                    onClick={handleNewWord}
                                    className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400 hover:text-indigo-600"
                                    title="Yeni Kelime"
                                >
                                    <RefreshCw size={20} className={isHovering ? "animate-spin-slow" : ""} />
                                </button>
                            </div>

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={randomWord.word}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                    className="space-y-4"
                                >
                                    <div>
                                        <h3 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight mb-1">
                                            {randomWord.word}
                                        </h3>
                                        <p className="text-xl text-slate-400 font-serif italic">
                                            {randomWord.pronunciation}
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        <div>
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">ANLAM</span>
                                            <p className="text-xl font-medium text-indigo-600">
                                                {randomWord.meaning}
                                            </p>
                                        </div>

                                        <div>
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">AÇIKLAMA</span>
                                            <p className="text-slate-600 leading-relaxed">
                                                {randomWord.description}
                                            </p>
                                        </div>

                                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mt-2">
                                            <p className="text-slate-600 italic text-sm">
                                                "{randomWord.example}"
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>

                            <div className="pt-4 border-t border-slate-100">
                                <p className="text-xs text-center text-slate-400">
                                    Kaybolmak bile bazen yeni bir şeyler öğrenmek için fırsattır.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

            </div>
        </div>
    );
}

// Yardımcı Bileşen: Yüzen Elementler
function FloatingElement({ children, delay, x, y }: { children: React.ReactNode, delay: number, x: string, y: string }) {
    return (
        <motion.div
            className="absolute text-slate-200 font-black text-6xl select-none pointer-events-none"
            style={{ left: x, top: y }}
            animate={{
                y: [0, -20, 0],
                opacity: [0.2, 0.5, 0.2]
            }}
            transition={{
                duration: 5,
                delay: delay,
                repeat: Infinity,
                ease: "easeInOut"
            }}
        >
            {children}
        </motion.div>
    );
}
