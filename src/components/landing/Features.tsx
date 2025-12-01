'use client';

import { motion } from 'framer-motion';
import { Brain, PenTool, LayoutGrid, Zap, Target, Sparkles } from 'lucide-react';

function BentoCard({
    children,
    className,
    delay = 0
}: {
    children: React.ReactNode,
    className?: string,
    delay?: number
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay }}
            className={`bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-100/50 transition-all duration-300 p-8 relative overflow-hidden group ${className}`}
        >
            {children}
        </motion.div>
    );
}

export default function Features() {
    return (
        <section id="features" className="py-24 bg-slate-50 relative overflow-hidden">
            <div className="max-w-5xl mx-auto px-6 relative z-10">

                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6">
                        Bilimsel Metotlarla <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Kalıcı Öğrenme</span>
                    </h2>
                    <p className="text-slate-600 text-lg">
                        Vocasun, sadece kelime ezberletmez. Beyninin çalışma prensiplerini kullanarak bilgiyi uzun süreli hafızana işler.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[240px]">

                    {/* Large Card - SRS */}
                    <BentoCard className="md:col-span-2 md:row-span-1 bg-gradient-to-br from-indigo-600 to-violet-700 text-white">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                        <div className="relative z-10 h-full flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                                        <Brain className="text-white" size={20} />
                                    </div>
                                    <h3 className="text-xl font-bold">Aralıklı Tekrar Sistemi (SRS)</h3>
                                </div>
                                <p className="text-indigo-100 text-sm max-w-md leading-relaxed">
                                    Unutma eğrisini kırın. Algoritmamız, bir kelimeyi tam unutmak üzereyken karşınıza çıkarır. Minimum tekrarla maksimum kalıcılık.
                                </p>
                            </div>
                            <div className="flex gap-2 mt-4">
                                <div className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-wider">Bilimsel</div>
                                <div className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-wider">Otomatik</div>
                            </div>
                        </div>
                    </BentoCard>

                    {/* Tall Card - Gamification */}
                    <BentoCard className="md:col-span-1 md:row-span-2 bg-white" delay={0.2}>
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-50 opacity-50"></div>
                        <div className="relative z-10 h-full flex flex-col">
                            <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-4">
                                <LayoutGrid size={20} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Oyunlaştırma</h3>
                            <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                                Sıkıcı dersleri unutun. Puan toplayın, seviye atlayın ve liderlik tablosunda yarışın.
                            </p>

                            {/* Visual Representation of Leaderboard */}
                            <div className="mt-auto space-y-2">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 border border-slate-100">
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${i === 1 ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-200 text-slate-600'}`}>{i}</div>
                                        <div className="h-1.5 w-16 bg-slate-200 rounded-full"></div>
                                        <div className="ml-auto h-1.5 w-6 bg-indigo-100 rounded-full"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </BentoCard>

                    {/* Small Card - Writing */}
                    <BentoCard className="md:col-span-1 md:row-span-1 bg-white" delay={0.3}>
                        <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4">
                            <PenTool size={20} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Aktif Yazma</h3>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            Sadece seçmek yetmez. Yazarak öğrenmek başarıyı %50 artırır.
                        </p>
                    </BentoCard>

                    {/* Small Card - AI */}
                    <BentoCard className="md:col-span-1 md:row-span-1 bg-white" delay={0.4}>
                        <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
                            <Sparkles size={20} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">AI Destekli</h3>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            Kişisel öğrenme hızınıza göre adapte olan akıllı içerik.
                        </p>
                    </BentoCard>

                </div>
            </div>
        </section>
    );
}



