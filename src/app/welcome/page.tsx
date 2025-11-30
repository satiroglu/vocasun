'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { ArrowRight, Check, Sparkles } from 'lucide-react';
import Logo from '@/components/Logo';

export default function Welcome() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);

        // Brand Colors Confetti (Indigo, Purple, Pink)
        const fireConfetti = () => {
            const colors = ['#4f46e5', '#7c3aed', '#db2777'];

            // Single burst from left
            confetti({
                particleCount: 50,
                angle: 60,
                spread: 55,
                origin: { x: 0, y: 0.8 },
                colors: colors
            });

            // Single burst from right
            confetti({
                particleCount: 50,
                angle: 120,
                spread: 55,
                origin: { x: 1, y: 0.8 },
                colors: colors
            });
        };

        // Small delay to ensure smooth entrance
        setTimeout(fireConfetti, 500);
    }, []);

    return (
        <div className="min-h-[100dvh] bg-slate-50 relative overflow-hidden flex flex-col items-center justify-center p-4">
            {/* Vocasun Brand Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-200/40 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-200/40 rounded-full blur-[100px] animate-pulse delay-1000" />
            </div>

            {/* Floating Sparkles */}
            {mounted && (
                <>
                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                        className="absolute top-1/4 left-1/4 text-indigo-300 hidden md:block"
                    >
                        <Sparkles size={32} />
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.7, duration: 0.5 }}
                        className="absolute bottom-1/4 right-1/4 text-purple-300 hidden md:block"
                    >
                        <Sparkles size={24} />
                    </motion.div>
                </>
            )}

            {/* Main Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative z-10 w-full max-w-lg p-8 md:p-12 text-center"
            >
                {/* Logo */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex justify-center mb-8"
                >
                    <Logo />
                </motion.div>

                {/* Success Icon */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.3 }}
                    className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-indigo-200"
                >
                    <Check size={40} className="text-white" strokeWidth={3} />
                </motion.div>

                {/* Text Content */}
                <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight"
                >
                    Aramıza Hoş Geldin!
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-lg text-slate-600 mb-10 leading-relaxed"
                >
                    Hesabın başarıyla oluşturuldu ve doğrulandı. <br />
                    Şimdi potansiyelini keşfetme zamanı.
                </motion.p>

                {/* Action Button */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <Link href="/dashboard" className="block w-full">
                        <button className="w-full group relative px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg shadow-xl shadow-indigo-200 hover:shadow-2xl hover:shadow-indigo-300 hover:bg-indigo-700 hover:scale-[1.02] transition-all duration-300">
                            <span className="relative flex items-center justify-center gap-2">
                                Öğrenmeye Başla
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </button>
                    </Link>
                </motion.div>
            </motion.div>

            {/* Footer Text */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-8 text-sm text-slate-400 font-medium"
            >
                Vocasun ile her gün daha ileriye.
            </motion.p>
        </div>
    );
}
