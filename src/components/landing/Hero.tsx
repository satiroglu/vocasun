import Link from 'next/link';
import { Sparkles, ArrowRight, CheckCircle } from 'lucide-react';
import Button from '@/components/Button';
import DynamicWordCard from '@/components/DynamicWordCard';

export default function Hero() {
    return (
        <header className="relative pt-24 pb-20 lg:pt-32 lg:pb-32 overflow-hidden">
            {/* Dynamic Background Elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-400/20 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-purple-400/20 rounded-full blur-[100px]"></div>
                <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-amber-300/20 rounded-full blur-[80px]"></div>
            </div>

            <div className="max-w-5xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center relative z-10">

                {/* Left: Text Content */}
                <div className="text-center lg:text-left">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-indigo-100 text-indigo-600 text-sm font-bold mb-8 shadow-sm  transition cursor-default">
                        <Sparkles size={16} className="fill-indigo-600" />
                        <span>Yapay Zeka Destekli Öğrenme</span>
                    </div>

                    <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-[1.1]">
                        Kelime Ezberleme, <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600">
                            Kalıcı Öğren.
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                        Sadece kart çevirmek yetmez. <b>Aktif yazma</b>, <b>dinleme</b> ve <b>akıllı tekrar sistemi (SRS)</b> ile İngilizce kelimeleri hafızana kalıcı olarak kazı.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                        <Link href="/register">
                            <Button className="w-full sm:w-auto px-8 py-4 text-lg h-auto shadow-indigo-300/50 hover:shadow-indigo-300/80" icon={<ArrowRight size={20} />}>
                                Ücretsiz Başla
                            </Button>
                        </Link>
                        <Link href="#learning-modes">
                            <Button variant="outline" className="w-full sm:w-auto px-8 py-4 text-lg h-auto">
                                Keşfet
                            </Button>
                        </Link>
                    </div>

                    <div className="mt-12 flex items-center justify-center lg:justify-start gap-8 text-sm text-slate-500 font-medium">
                        <div className="flex items-center gap-2">
                            <div className="bg-green-100 p-1 rounded-full"><CheckCircle size={14} className="text-green-600" /></div>
                            <span>Kredi Kartı Gerekmez</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="bg-green-100 p-1 rounded-full"><CheckCircle size={14} className="text-green-600" /></div>
                            <span>10.000+ Kelime</span>
                        </div>
                    </div>
                </div>

                {/* Right: Visual Demo */}
                <div className="relative block perspective-1000 mt-10 lg:mt-0 flex flex-col items-center">
                    {/* Computer Window Frame */}
                    <div className="relative w-full max-w-[380px] bg-white rounded-2xl shadow-2xl shadow-indigo-200/40 border border-slate-200 overflow-hidden">

                        {/* Window Header */}
                        <div className="bg-slate-50/80 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-slate-100">
                            <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-red-400/30"></div>
                                <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-yellow-400/30"></div>
                                <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-green-400/30"></div>
                            </div>
                            <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                Canlı Demo
                            </div>
                        </div>

                        {/* Window Content */}
                        <div className="p-6 bg-slate-50/30 relative min-h-[460px] flex flex-col items-center justify-center">
                            <div className="w-full">
                                <DynamicWordCard disableAudio={true} />
                            </div>
                        </div>
                    </div>

                    {/* Info Text (Moved Below) */}
                    <div className="mt-6 text-center">
                        <span className="text-sm font-medium text-slate-400/80 tracking-wide">
                            Her Gün 5 Yeni Kelime
                        </span>
                    </div>
                </div>
            </div>
        </header>
    );
}
