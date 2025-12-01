'use client';

import { motion } from 'framer-motion';
import { Check, RotateCw, AlertCircle, Sparkles, PenTool, LayoutGrid, BookOpen } from 'lucide-react';
import { useState, useEffect } from 'react';

// --- Mini Components for Animations ---

function FlashcardPreview() {
    const [isFlipped, setIsFlipped] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setIsFlipped((prev) => !prev);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full h-40 relative perspective">
            <motion.div
                className="w-full h-full relative transform-style-3d transition-all duration-500"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
            >
                {/* Front */}
                <div className="absolute inset-0 backface-hidden bg-white border-2 border-indigo-100 rounded-xl flex flex-col items-center justify-center shadow-sm">
                    <div className="absolute top-3 right-3 text-indigo-300">
                        <RotateCw size={18} />
                    </div>
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Kelime</span>
                    <span className="text-2xl font-bold text-slate-800">Zenith</span>
                </div>
                {/* Back */}
                <div
                    className="absolute inset-0 backface-hidden bg-indigo-600 rounded-xl flex flex-col items-center justify-center shadow-sm"
                    style={{ transform: "rotateY(180deg)" }}
                >
                    <div className="absolute top-3 right-3 text-indigo-400">
                        <RotateCw size={18} />
                    </div>
                    <span className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-2">Anlamı</span>
                    <span className="text-xl font-bold text-white">Zirve, doruk noktası</span>
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

                // 2. Synonym
                await type("Luck");
                if (isCancelled) return;
                setState({ text: "Luck", status: "warning", msg: "Yakın Anlam" });
                await new Promise(r => setTimeout(r, 2000));

                // Clear
                setState({ text: "", status: "neutral", msg: "" });
                await new Promise(r => setTimeout(r, 500));

                // 3. Correct
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
        <div className="w-full h-40 bg-slate-50 border-2 border-slate-100 rounded-xl flex flex-col items-center justify-center p-4 relative overflow-hidden">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">Yazma Pratiği</span>

            <div className={`w-full bg-white border transition-colors duration-300 rounded-lg p-3 flex items-center shadow-inner relative
        ${state.status === 'error' ? 'border-red-200 bg-red-50' : ''}
        ${state.status === 'warning' ? 'border-amber-200 bg-amber-50' : ''}
        ${state.status === 'success' ? 'border-green-200 bg-green-50' : 'border-slate-200'}
      `}>
                <span className="text-lg font-mono text-slate-800">{state.text}</span>
                <motion.div
                    animate={{ opacity: [1, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className="w-0.5 h-5 bg-indigo-500 ml-1"
                />
            </div>

            {/* Feedback Badge */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: state.msg ? 1 : 0, y: state.msg ? 0 : 10 }}
                className={`absolute bottom-4 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm
          ${state.status === 'error' ? 'bg-red-100 text-red-600' : ''}
          ${state.status === 'warning' ? 'bg-amber-100 text-amber-700' : ''}
          ${state.status === 'success' ? 'bg-green-100 text-green-700' : ''}
        `}
            >
                {state.status === 'error' && <AlertCircle size={12} />}
                {state.status === 'warning' && <Sparkles size={12} />}
                {state.status === 'success' && <Check size={12} />}
                {state.msg}
            </motion.div>
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
        <div className="w-full h-40 bg-slate-50 border-2 border-slate-100 rounded-xl flex flex-col p-4 gap-2 justify-center">
            <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200 shadow-sm opacity-50">
                <span className="text-sm text-slate-600">A) Permanent</span>
            </div>
            <motion.div
                animate={{
                    borderColor: selected === 1 ? '#22c55e' : '#e2e8f0',
                    backgroundColor: selected === 1 ? '#f0fdf4' : '#ffffff'
                }}
                className="flex items-center justify-between p-2 rounded-lg border border-slate-200 shadow-sm relative overflow-hidden"
            >
                <span className="text-sm font-bold text-slate-800">B) Temporary</span>
                {selected === 1 && <Check size={16} className="text-green-600" />}
            </motion.div>
            <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200 shadow-sm opacity-50">
                <span className="text-sm text-slate-600">C) Eternal</span>
            </div>
        </div>
    );
}

// --- Main Component ---

const modes = [
    {
        id: 'writing',
        title: 'Yaz',
        description: 'Sadece okumak yetmez. Kelimeyi yazarak kas hafızanı tetikle. Sistem anlık olarak yazım hatalarını düzeltir, eş ve zıt anlamlılarla kelime dağarcığını zenginleştirir.',
        component: <WritingPreview />,
        icon: PenTool,
        color: 'text-purple-500'
    },
    {
        id: 'quiz',
        title: 'Seç',
        description: 'Beynini İngilizce düşünmeye alıştır. Kelime ve anlam arasındaki bağlantıyı hızlandır, doğru kelimeyi saniyeler içinde bulma refleksini kazan.',
        component: <QuizPreview />,
        icon: LayoutGrid,
        color: 'text-indigo-500'
    },
    {
        id: 'flashcards',
        title: 'Kart',
        description: 'Dikkatin dağılmadan, saf bilgiye odaklan. Klasik yöntemin dijital gücüyle görsel hafızanı kullan, kelimeleri tekrar ederek pekiştir.',
        component: <FlashcardPreview />,
        icon: BookOpen,
        color: 'text-emerald-500'
    }
];

export default function LearningModes() {
    return (
        <section id="learning-modes" className="py-24 bg-white relative overflow-hidden">
            <div className="max-w-5xl mx-auto px-6 relative z-10">

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">3 Farklı Mod ile<br /></span> Dili Derinlemesine Öğren
                    </h2>
                    <p className="text-slate-600 text-lg max-w-2xl mx-auto">
                        Tek düze öğrenmeye sıkışıp kalma. Vocasun, bilimsel olarak kanıtlanmış metotlarla kelimeleri kalıcı hafızana işler.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-8">
                    {modes.map((mode, index) => (
                        <motion.div
                            key={mode.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            whileHover={{ y: -10 }}
                            className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl hover:shadow-2xl transition-all duration-300 group relative overflow-hidden flex flex-col"
                        >
                            {/* Background Icon */}
                            <div className={`absolute -bottom-6 -right-6 opacity-5 group-hover:opacity-10 transition-opacity duration-500 text-slate-200`}>
                                <mode.icon size={180} />
                            </div>

                            {/* Animation Container */}
                            <div className="mb-6 rounded-2xl overflow-hidden relative z-10">
                                {mode.component}
                            </div>

                            <div className="flex items-center justify-between mb-3 relative z-10">
                                <h3 className="text-2xl font-bold text-slate-900 group-hover:text-indigo-700 transition-colors flex items-center gap-3">
                                    <div className={`p-2 rounded-lg bg-slate-50 group-hover:bg-white group-hover:shadow-md transition-all duration-300 ${mode.color}`}>
                                        <mode.icon size={24} />
                                    </div>
                                    {mode.title}
                                </h3>
                            </div>

                            <p className="text-slate-600 leading-relaxed text-sm relative z-10">
                                {mode.description}
                            </p>

                        </motion.div>
                    ))}
                </div>

            </div>
        </section>
    );
}
