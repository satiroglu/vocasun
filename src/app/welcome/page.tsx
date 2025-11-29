'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import Button from '@/components/Button';
import Logo from '@/components/Logo';

export default function Welcome() {
    useEffect(() => {
        // Trigger confetti animation on mount
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min: number, max: number) => {
            return Math.random() * (max - min) + min;
        };

        const interval: NodeJS.Timeout = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            // since particles fall down, start a bit higher than random
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
            });
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
            });
        }, 250);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden flex flex-col items-center justify-center p-4 sm:p-6">
            {/* Dynamic Background Elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-400/20 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-indigo-400/20 rounded-full blur-[100px]"></div>
            </div>

            <div className="relative z-10 w-full max-w-md bg-white/80 backdrop-blur-xl p-8 rounded-xl shadow-2xl shadow-indigo-100/50 border border-white/50 text-center">
                <div className="flex justify-center mb-8">
                    <Logo />
                </div>

                <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner animate-bounce-slow">
                    <CheckCircle size={48} strokeWidth={3} />
                </div>

                <h2 className="text-3xl font-bold text-slate-900 mb-3">Hoş Geldin!</h2>
                <p className="text-slate-600 mb-8 text-base leading-relaxed px-2">
                    E-posta adresin başarıyla doğrulandı. Artık Vocasun ailesinin bir parçasısın. Öğrenme yolculuğuna başlamaya hazır mısın?
                </p>

                <Link href="/dashboard" className="block w-full">
                    <Button className="w-full h-14 text-lg font-bold shadow-indigo-200 hover:shadow-indigo-300 flex items-center justify-center gap-2 group">
                        Öğrenmeye Başla
                        <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </Button>
                </Link>
            </div>
        </div>
    );
}
