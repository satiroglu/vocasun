'use client';

import { motion } from 'framer-motion';
import { Brain, TrendingUp, Clock } from 'lucide-react';

export default function ScientificBasis() {
    return (
        <section className="py-24 bg-slate-50 relative overflow-hidden">
            <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">

                {/* Left: Content */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-bold mb-6">
                        <Brain size={18} />
                        <span>Bilimsel Metot</span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
                        Unutma Eğrisini <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Yenin.</span>
                    </h2>
                    <p className="text-slate-600 text-lg mb-8 leading-relaxed">
                        Hermann Ebbinghaus'un "Unutma Eğrisi"ne göre, öğrendiğimiz bir bilginin %70'ini 24 saat içinde unuturuz.
                        <br /><br />
                        <strong>Vocasun</strong>, Aralıklı Tekrar Sistemi (SRS) kullanarak bu eğriyi kırar. Kelimeyi tam unutmak üzereyken size hatırlatır ve kalıcı hafızaya aktarır.
                    </p>

                    <div className="space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-red-100 text-red-600 rounded-xl flex items-center justify-center shrink-0">
                                <TrendingUp size={20} className="rotate-180" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900">Klasik Yöntem</h4>
                                <p className="text-sm text-slate-500">Tekrar edilmeyen bilgi hızla kaybolur.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center shrink-0">
                                <TrendingUp size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900">Vocasun Yöntemi</h4>
                                <p className="text-sm text-slate-500">Düzenli aralıklarla tekrar, bilgiyi %95 oranında korur.</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Right: Animated Graph */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="bg-white rounded-3xl p-8 shadow-2xl shadow-indigo-100/50 border border-slate-100 relative"
                >
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Clock size={20} className="text-slate-400" />
                        Hafıza Tutma Oranı
                    </h3>

                    <div className="relative h-64 w-full">
                        {/* Grid Lines */}
                        <div className="absolute inset-0 flex flex-col justify-between text-xs text-slate-300">
                            <span>100%</span>
                            <span>75%</span>
                            <span>50%</span>
                            <span>25%</span>
                            <span>0%</span>
                        </div>

                        {/* Graph Area */}
                        <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none">
                            {/* Forgetting Curve (Red) */}
                            <motion.path
                                d="M0,0 Q50,200 300,250"
                                fill="none"
                                stroke="#ef4444"
                                strokeWidth="3"
                                strokeDasharray="10 5"
                                initial={{ pathLength: 0 }}
                                whileInView={{ pathLength: 1 }}
                                transition={{ duration: 2, ease: "easeInOut" }}
                            />

                            {/* SRS Curve (Green/Indigo) - Sawtooth */}
                            <motion.path
                                d="M0,0 L50,80 L50,10 L120,60 L120,5 L200,40 L200,0 L300,20"
                                fill="none"
                                stroke="#4f46e5"
                                strokeWidth="4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                initial={{ pathLength: 0 }}
                                whileInView={{ pathLength: 1 }}
                                transition={{ duration: 3, ease: "easeInOut", delay: 1 }}
                            />

                            {/* Points */}
                            <motion.circle cx="50" cy="10" r="6" fill="#4f46e5" initial={{ scale: 0 }} whileInView={{ scale: 1 }} transition={{ delay: 1.5 }} />
                            <motion.circle cx="120" cy="5" r="6" fill="#4f46e5" initial={{ scale: 0 }} whileInView={{ scale: 1 }} transition={{ delay: 2.0 }} />
                            <motion.circle cx="200" cy="0" r="6" fill="#4f46e5" initial={{ scale: 0 }} whileInView={{ scale: 1 }} transition={{ delay: 2.5 }} />
                        </svg>

                        {/* Labels */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ delay: 2 }}
                            className="absolute top-20 left-12 bg-red-50 text-red-600 text-xs font-bold px-2 py-1 rounded shadow-sm"
                        >
                            Unutma
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ delay: 3 }}
                            className="absolute top-0 right-10 bg-indigo-50 text-indigo-600 text-xs font-bold px-2 py-1 rounded shadow-sm"
                        >
                            Kalıcı Hafıza
                        </motion.div>
                    </div>

                    <div className="flex justify-between text-xs text-slate-400 mt-4 font-medium uppercase tracking-wider">
                        <span>1. Gün</span>
                        <span>3. Gün</span>
                        <span>1. Hafta</span>
                        <span>1. Ay</span>
                    </div>

                </motion.div>

            </div>
        </section>
    );
}
