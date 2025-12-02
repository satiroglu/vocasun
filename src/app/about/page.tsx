'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/landing/Footer';
import { Target, Heart, Zap, ArrowRight, Star, Globe, Check, RotateCw, AlertCircle, Sparkles, PenTool, LayoutGrid, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';

// --- Animation Components ---

function FlashcardPreview() {
    const [isFlipped, setIsFlipped] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setIsFlipped((prev) => !prev);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full h-full relative perspective flex items-center justify-center p-6">
            <motion.div
                className="w-full max-w-[280px] aspect-[4/3] relative transform-style-3d transition-all duration-500"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
            >
                {/* Front */}
                <div className="absolute inset-0 backface-hidden bg-white border-2 border-indigo-100 rounded-2xl flex flex-col items-center justify-center shadow-sm">
                    <div className="absolute top-4 right-4 text-indigo-300">
                        <RotateCw size={20} />
                    </div>
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">Kelime</span>
                    <span className="text-3xl font-bold text-slate-800">Zenith</span>
                </div>
                {/* Back */}
                <div
                    className="absolute inset-0 backface-hidden bg-indigo-600 rounded-2xl flex flex-col items-center justify-center shadow-sm"
                    style={{ transform: "rotateY(180deg)" }}
                >
                    <div className="absolute top-4 right-4 text-indigo-400">
                        <RotateCw size={20} />
                    </div>
                    <span className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-3">Anlamı</span>
                    <span className="text-2xl font-bold text-white text-center px-4">Zirve, doruk noktası</span>
                </div>
            </motion.div>
        </div>
    );
}

function WritingPreview() {
    const [state, setState] = useState({ text: "", status: "neutral", msg: "" });

    useEffect(() => {
        let isCancelled = false;

        const runSequence = async () => {
            const type = async (word: string) => {
                for (let i = 1; i <= word.length; i++) {
                    if (isCancelled) return;
                    setState(prev => ({ ...prev, text: word.slice(0, i), status: "neutral", msg: "" }));
                    await new Promise(r => setTimeout(r, 100));
                }
            };

            while (!isCancelled) {
                // 1. Typo
                await type("Serendipt");
                if (isCancelled) return;
                setState({ text: "Serendipt", status: "error", msg: "Yazım Hatası" });
                await new Promise(r => setTimeout(r, 2000));

                // Clear
                setState({ text: "", status: "neutral", msg: "" });
                await new Promise(r => setTimeout(r, 500));

                // 2. Correct
                await type("Serendipity");
                if (isCancelled) return;
                setState({ text: "Serendipity", status: "success", msg: "Mükemmel!" });
                await new Promise(r => setTimeout(r, 3000));

                // Clear
                setState({ text: "", status: "neutral", msg: "" });
                await new Promise(r => setTimeout(r, 500));
            }
        };

        runSequence();
        return () => { isCancelled = true; };
    }, []);

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-slate-50/50">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4">Yazma Pratiği</span>

            <div className={`w-full max-w-[280px] bg-white border-2 transition-colors duration-300 rounded-xl p-4 flex items-center shadow-sm relative
        ${state.status === 'error' ? 'border-red-200 bg-red-50' : ''}
        ${state.status === 'success' ? 'border-green-200 bg-green-50' : 'border-slate-200'}
      `}>
                <span className="text-xl font-mono text-slate-800">{state.text}</span>
                <motion.div
                    animate={{ opacity: [1, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className="w-0.5 h-6 bg-indigo-500 ml-1"
                />
            </div>

            {/* Feedback Badge */}
            <div className="h-8 mt-4">
                <AnimatePresence mode="wait">
                    {state.msg && (
                        <motion.div
                            key={state.msg}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className={`px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 shadow-sm
                  ${state.status === 'error' ? 'bg-red-100 text-red-600' : ''}
                  ${state.status === 'success' ? 'bg-green-100 text-green-700' : ''}
                `}
                        >
                            {state.status === 'error' && <AlertCircle size={14} />}
                            {state.status === 'success' && <Check size={14} />}
                            {state.msg}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function QuizPreview() {
    const [selected, setSelected] = useState<number | null>(null);

    useEffect(() => {
        const interval = setInterval(() => {
            setSelected(1); // Select correct answer
            setTimeout(() => setSelected(null), 2000); // Reset
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-8 gap-3">
            <div className="w-full max-w-[280px] flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-sm opacity-50">
                <span className="text-slate-600 font-medium">A) Permanent</span>
            </div>
            <motion.div
                animate={{
                    borderColor: selected === 1 ? '#22c55e' : '#e2e8f0',
                    backgroundColor: selected === 1 ? '#f0fdf4' : '#ffffff',
                    scale: selected === 1 ? 1.02 : 1
                }}
                className="w-full max-w-[280px] flex items-center justify-between p-3 rounded-xl border-2 border-slate-200 shadow-sm relative overflow-hidden transition-all"
            >
                <span className="font-bold text-slate-800">B) Temporary</span>
                {selected === 1 && <Check size={18} className="text-green-600" />}
            </motion.div>
            <div className="w-full max-w-[280px] flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-sm opacity-50">
                <span className="text-slate-600 font-medium">C) Eternal</span>
            </div>
        </div>
    );
}

function LearningVisuals() {
    const [activeTab, setActiveTab] = useState(0);
    const tabs = [
        { id: 0, label: 'Kart', icon: BookOpen, component: <FlashcardPreview /> },
        { id: 1, label: 'Yaz', icon: PenTool, component: <WritingPreview /> },
        { id: 2, label: 'Seç', icon: LayoutGrid, component: <QuizPreview /> },
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveTab((prev) => (prev + 1) % tabs.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [tabs.length]);

    return (
        <div className="relative bg-slate-50 rounded-3xl border border-slate-100 shadow-2xl overflow-hidden h-[400px] flex flex-col">
            {/* Header / Tabs */}
            <div className="flex border-b border-slate-100 bg-white/50 backdrop-blur-sm">
                {tabs.map((tab, index) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(index)}
                        className={`flex-1 py-4 flex items-center justify-center gap-2 text-sm font-bold transition-all
                            ${activeTab === index ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-400 hover:text-slate-600'}
                        `}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 relative">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0"
                    >
                        {tabs[activeTab].component}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans overflow-hidden">
            <Navbar />

            <main className="pt-24">

                {/* Hero Section */}
                <section className="relative py-20 lg:py-32 overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100/50 via-slate-50 to-slate-50 -z-10"></div>
                    <div className="container mx-auto px-4 sm:px-6 max-w-5xl relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="text-center max-w-4xl mx-auto"
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-sm font-bold mb-6">
                                <Star size={14} className="fill-indigo-600" />
                                <span>Vocasun Hikayesi</span>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-8 leading-tight">
                                Sınırları Aş, <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Dünyayı Keşfet.</span>
                            </h1>
                            <p className="text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto mb-10">
                                Sadece bir dil öğrenme uygulaması değil, potansiyelinizi keşfetmeniz için tasarlanmış bir yolculuk.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Story Section (Modern Split Layout) */}
                <section className="py-20 bg-white relative">
                    <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            <motion.div
                                initial={{ opacity: 0, x: -50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8 }}
                                className="relative"
                            >
                                <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-100 rounded-full blur-3xl opacity-50"></div>
                                {/* Replaced static card with LearningVisuals animation */}
                                <LearningVisuals />
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                            >
                                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Hikayemiz</h2>
                                <div className="space-y-6 text-lg text-slate-600">
                                    <p>
                                        2025 yılında, dil öğrenmenin karmaşık, pahalı ve çoğu zaman sonuçsuz kalan yöntemlerle dolu olduğu bir dünyada, daha basit ve etkili bir yol olması gerektiğine inanarak yola çıktık.
                                    </p>
                                    <p>
                                        Geleneksel "kelime listesi ezberleme" yöntemlerinin aksine, bağlam içinde öğrenmenin ve aktif kullanımın gücüne inanıyoruz. Vocasun, sadece kelime ezberleten bir uygulama değil, size o kelimeleri hayatınızda nasıl kullanacağınızı öğreten akıllı bir yol arkadaşıdır.
                                    </p>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Values Section (2x2 Grid) */}
                <section className="py-20 bg-slate-50">
                    <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Değerlerimiz</h2>
                            <p className="text-lg text-slate-600">Bizi biz yapan temel prensipler.</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Card 1: Mission */}
                            <motion.div
                                whileHover={{ y: -5 }}
                                className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 h-full"
                            >
                                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6">
                                    <Target size={28} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">Misyonumuz</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    Herkesin yeni bir dili özgüvenle konuşabilmesi için en modern teknolojileri ve bilimsel öğrenme metotlarını erişilebilir kılmak.
                                </p>
                            </motion.div>

                            {/* Card 2: Passion */}
                            <motion.div
                                whileHover={{ y: -5 }}
                                className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 h-full"
                            >
                                <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 mb-6">
                                    <Heart size={28} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">Tutkumuz</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    Öğrenme sürecini oyunlaştırarak, motivasyonu her zaman yüksek tutmak. Kullanıcılarımızın başarısı bizim en büyük ödülümüzdür.
                                </p>
                            </motion.div>

                            {/* Card 3: Technology */}
                            <motion.div
                                whileHover={{ y: -5 }}
                                className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 h-full"
                            >
                                <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mb-6">
                                    <Zap size={28} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">Teknolojimiz</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    Yapay zeka destekli algoritmalarımız, öğrenme hızınızı ve stilinizi analiz eder. Size en uygun kelimeleri, en doğru zamanda karşınıza çıkarır.
                                </p>
                            </motion.div>

                            {/* Card 4: Global */}
                            <motion.div
                                whileHover={{ y: -5 }}
                                className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 h-full text-white"
                            >
                                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-white mb-6">
                                    <Globe size={28} />
                                </div>
                                <h3 className="text-xl font-bold mb-3">Global Vizyon</h3>
                                <p className="text-slate-300 leading-relaxed">
                                    Sınırları kaldırın. Vocasun ile dünya vatandaşı olma yolunda ilk adımı atın. Kültürler arası köprüler kurun.
                                </p>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-24 bg-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-50/50 via-white to-white"></div>
                    <div className="container mx-auto px-4 sm:px-6 max-w-4xl text-center relative z-10">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Hazır mısınız?</h2>
                            <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
                                Kelime hazinenizi geliştirmek ve İngilizceyi özgüvenle konuşmak için bugün Vocasun'a katılın.
                            </p>
                            <Link
                                href="/register"
                                className="inline-flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-slate-800 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
                            >
                                Hemen Başla
                                <ArrowRight size={20} />
                            </Link>
                        </motion.div>
                    </div>
                </section>

            </main>
            <Footer />
        </div>
    );
}
