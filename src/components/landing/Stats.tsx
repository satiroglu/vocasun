'use client';

import { motion } from 'framer-motion';
import { Users, BookOpen, Trophy, Star } from 'lucide-react';

function StatItem({ icon, number, label, delay, color }: { icon: React.ReactNode, number: string, label: string, delay: number, color: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay }}
            className="flex flex-col items-center justify-center p-6 group cursor-default relative"
        >
            <div className={`w-12 h-12 rounded-2xl ${color} bg-opacity-10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <div className={`text-${color.split('-')[1]}-600`}>
                    {icon}
                </div>
            </div>
            <div className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-1 tracking-tight">
                {number}
            </div>
            <div className="text-sm font-bold text-slate-500 uppercase tracking-wide">
                {label}
            </div>
        </motion.div>
    )
}

export default function Stats() {
    return (
        <section className="py-10 bg-white relative z-20 -mt-8">
            <div className="max-w-5xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="bg-white rounded-3xl shadow-xl shadow-indigo-100/50 border border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-0 divide-x-0 md:divide-x divide-slate-100 p-4"
                >
                    <StatItem
                        icon={<BookOpen size={24} className="text-indigo-600" />}
                        number="10K+"
                        label="Kelime"
                        delay={0}
                        color="bg-indigo-100"
                    />
                    <StatItem
                        icon={<Users size={24} className="text-violet-600" />}
                        number="50K+"
                        label="Öğrenci"
                        delay={0.1}
                        color="bg-violet-100"
                    />
                    <StatItem
                        icon={<Trophy size={24} className="text-amber-600" />}
                        number="1M+"
                        label="Pratik"
                        delay={0.2}
                        color="bg-amber-100"
                    />
                    <StatItem
                        icon={<Star size={24} className="text-emerald-600" />}
                        number="4.9"
                        label="Puan"
                        delay={0.3}
                        color="bg-emerald-100"
                    />
                </motion.div>
            </div>
        </section>
    );
}
