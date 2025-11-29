'use client';

import { Info as InfoIcon, Brain, Trophy, CheckCircle, Clock, Sparkles, Sun, Target, TrendingUp, BookOpen, PenTool, LayoutGrid } from 'lucide-react';
import Logo from '@/components/Logo';

export default function Info() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans pt-20 pb-20">
            <div className="flex-grow max-w-5xl mx-auto w-full px-4 sm:px-6 space-y-8">

                {/* Header */}
                <div className="flex items-center gap-5 mb-8">
                    <div className="shrink-0 p-4 bg-indigo-50 text-indigo-600 rounded-2xl shadow-sm border border-indigo-100">
                        <InfoIcon size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-1">Sistem Nasıl Çalışıyor?</h1>
                        <p className="text-slate-500 font-medium">Vocasun'ın bilimsel öğrenme metodolojisini keşfet.</p>
                    </div>
                </div>

                <div className="space-y-8 pb-10">

                    {/* 1. BİLİMSEL METOT (SRS) */}
                    <section className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-8 text-white shadow-xl shadow-indigo-200 relative overflow-hidden">
                        <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                                        <Brain size={32} className="text-white" />
                                    </div>
                                    <h2 className="text-2xl font-bold">Beyin Nasıl Unutmaz?</h2>
                                </div>
                                <p className="text-indigo-100 leading-relaxed text-lg mb-6">
                                    Beynimiz, öğrendiği bir bilgiyi tekrar etmezse 24 saat içinde %70'ini unutur.
                                    Vocasun, <b>Aralıklı Tekrar Sistemi (SRS)</b> kullanarak bu eğriyi kırar.
                                </p>
                            </div>

                            {/* Görsel Zaman Çizelgesi */}
                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/20">
                                <h3 className="font-bold mb-3 flex items-center gap-2"><Clock size={18} /> Tekrar Algoritması</h3>
                                <div className="flex justify-between items-center text-xs sm:text-sm font-medium text-indigo-100">
                                    <div className="flex flex-col items-center gap-1">
                                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                                        <span>1. Gün</span>
                                    </div>
                                    <div className="h-0.5 flex-grow bg-white/30 mx-2"></div>
                                    <div className="flex flex-col items-center gap-1">
                                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                                        <span>3. Gün</span>
                                    </div>
                                    <div className="h-0.5 flex-grow bg-white/30 mx-2"></div>
                                    <div className="flex flex-col items-center gap-1">
                                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                                        <span>7. Gün</span>
                                    </div>
                                    <div className="h-0.5 flex-grow bg-white/30 mx-2"></div>
                                    <div className="flex flex-col items-center gap-1">
                                        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.8)]"></div>
                                        <span className="text-white font-bold">20+ Gün</span>
                                    </div>
                                </div>
                                <p className="mt-3 text-xs text-indigo-200 italic text-center">
                                    Doğru bildikçe aralıklar açılır. Yanlış yaparsan sayaç sıfırlanır.
                                </p>
                            </div>
                        </div>
                        <Brain className="absolute -right-10 -bottom-10 text-white opacity-10 w-64 h-64" />
                    </section>

                    {/* 2. ÖĞRENME MODLARI */}
                    <section className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100">
                        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <PenTool className="text-indigo-600" /> 3 Farklı Öğrenme Modu
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="flex flex-col gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 h-full">
                                <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center"><PenTool size={20} /></div>
                                <div>
                                    <h3 className="font-bold text-slate-800 mb-1">Yazma Modu</h3>
                                    <p className="text-sm text-slate-600">Kelimenin İngilizcesini klavyeyle yazmanı ister. Hafızayı en çok zorlayan ve en etkili yöntemdir.</p>
                                </div>
                            </div>
                            <div className="flex flex-col gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 h-full">
                                <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center"><LayoutGrid size={20} /></div>
                                <div>
                                    <h3 className="font-bold text-slate-800 mb-1">Seçme Modu</h3>
                                    <p className="text-sm text-slate-600">Çoktan seçmeli test mantığıdır. Hızlı tekrar yapmak için idealdir.</p>
                                </div>
                            </div>
                            <div className="flex flex-col gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 h-full">
                                <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center"><BookOpen size={20} /></div>
                                <div>
                                    <h3 className="font-bold text-slate-800 mb-1">Kart Modu</h3>
                                    <p className="text-sm text-slate-600">
                                        Kartı çevirip kendini test edersin. Klasik flashcard deneyimi sunar.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 3. KELİME DURUMLARI & GAMIFICATION GRID */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                        {/* KELİME DURUMLARI */}
                        <section className="space-y-4 h-full flex flex-col">
                            <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                                <Target size={22} className="text-indigo-500" /> Bir Kelimenin Yolculuğu
                            </h3>

                            <div className="grid sm:grid-cols-2 gap-4 flex-grow">
                                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:border-yellow-400 transition group h-full">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="bg-yellow-100 text-yellow-700 p-2 rounded-lg"><Clock size={20} /></span>
                                        <span className="font-bold text-slate-800">Çalışılıyor</span>
                                    </div>
                                    <p className="text-sm text-slate-500">
                                        Sistem, sen bu kelimeyi tam öğrenene kadar <b>sık sık</b> karşına çıkarır.
                                    </p>
                                </div>

                                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:border-green-400 transition group h-full">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="bg-green-100 text-green-700 p-2 rounded-lg"><CheckCircle size={20} /></span>
                                        <span className="font-bold text-slate-800">Öğrenildi</span>
                                    </div>
                                    <p className="text-sm text-slate-500">
                                        Bir sonraki tekrar tarihi <b>20 gün sonrasına</b> atıldığında, "Öğrenildi" kabul edilir.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* GAMIFICATION */}
                        <section className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm h-full flex flex-col">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                                    <Trophy size={22} className="text-yellow-500" /> Puan & Seviye
                                </h3>
                                <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full">Motivasyon</span>
                            </div>

                            <div className="space-y-4 flex-grow">
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-green-500 text-white p-1.5 rounded-md"><CheckCircle size={16} /></div>
                                        <span className="font-medium text-slate-700">Doğru Cevap</span>
                                    </div>
                                    <span className="font-bold text-green-600 text-lg">+10 XP</span>
                                </div>

                                <div className="flex items-center gap-4 p-4 border border-slate-100 rounded-xl bg-gradient-to-r from-white to-slate-50">
                                    <div className="bg-purple-100 text-purple-600 p-3 rounded-full">
                                        <TrendingUp size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800">Seviye Sistemi</h4>
                                        <p className="text-sm text-slate-500">Her <b className="text-indigo-600">100 XP</b> topladığında seviye atlarsın.</p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* 5. PEDAGOJİK İPUCU */}
                    <section className="bg-orange-50 p-6 rounded-3xl border border-orange-100 relative overflow-hidden">
                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                            <div className="shrink-0 p-4 bg-orange-100 text-orange-600 rounded-full">
                                <BookOpen size={32} />
                            </div>
                            <div>
                                <h3 className="font-bold text-orange-900 text-lg mb-2">
                                    Neden "Yazarak" Çalışmalısın?
                                </h3>
                                <p className="text-orange-800 leading-relaxed">
                                    Kelimeyi klavyeyle yazmak beynini <b>"Aktif Hatırlama"</b> yapmaya zorlar.
                                    Bu, kelimenin yazılışını ve anlamını hafızana %50 daha güçlü kazır. Zor gelse de yazma modundan vazgeçme!
                                </p>
                            </div>
                        </div>
                        <Sparkles className="absolute -right-4 -top-4 text-orange-200 w-32 h-32 opacity-50" />
                    </section>

                </div>
            </div>
        </div>
    );
}