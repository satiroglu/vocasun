'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/landing/Footer';
import { motion } from 'framer-motion';
import { Brain, Sparkles, Zap, LayoutGrid, ArrowRight, Layers, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export default function FeaturesPage() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans overflow-hidden">
            <Navbar />

            <main className="pt-24">

                {/* Hero Section */}
                <section className="relative py-20 lg:py-32 overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100/50 via-slate-50 to-slate-50 -z-10"></div>
                    <div className="container mx-auto px-4 sm:px-6 max-w-5xl relative z-10 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-sm font-bold mb-6">
                                <Sparkles size={14} className="fill-indigo-600" />
                                <span>Vocasun Özellikleri</span>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-8 leading-tight">
                                Dil Öğrenmenin <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Geleceği Burada.</span>
                            </h1>
                            <p className="text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto mb-10">
                                Sıradan ezber yöntemlerini unutun. Vocasun, yapay zeka ve bilimsel metotlarla size özel bir öğrenme deneyimi sunar.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Feature 1: AI & Personalization */}
                <section className="py-20 bg-white">
                    <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            <motion.div
                                initial={{ opacity: 0, x: -50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8 }}
                            >
                                <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mb-6">
                                    <Brain size={32} />
                                </div>
                                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Yapay Zeka Destekli Kişiselleştirme</h2>
                                <p className="text-lg text-slate-600 leading-relaxed mb-6">
                                    Herkesin öğrenme hızı ve stili farklıdır. Vocasun'ın akıllı algoritmaları, performansınızı analiz eder ve size en uygun kelimeleri, en doğru zamanda karşınıza çıkarır.
                                </p>
                                <ul className="space-y-3">
                                    {[
                                        "Kişiye özel tekrar aralıkları",
                                        "Zayıf olduğunuz konulara odaklanma",
                                        "Dinamik zorluk seviyesi"
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                                            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                                <Zap size={14} />
                                            </div>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, x: 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className="relative"
                            >
                                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-3xl rotate-3 opacity-20 blur-2xl"></div>
                                <div className="relative bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-2xl text-white overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
                                    <div className="relative z-10">
                                        <div className="flex items-center justify-between mb-8">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold">AI</div>
                                                <div>
                                                    <div className="font-bold">Öğrenme Analizi</div>
                                                    <div className="text-xs text-slate-400">Canlı Veri</div>
                                                </div>
                                            </div>
                                            <div className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-bold border border-green-500/20">
                                                Optimize Edildi
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-indigo-500 w-[85%]"></div>
                                            </div>
                                            <div className="flex justify-between text-sm text-slate-400">
                                                <span>Kelime Hafızası</span>
                                                <span className="text-white font-bold">%85</span>
                                            </div>
                                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-violet-500 w-[62%]"></div>
                                            </div>
                                            <div className="flex justify-between text-sm text-slate-400">
                                                <span>Grammer Yapısı</span>
                                                <span className="text-white font-bold">%62</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Feature 2: Learning Modes */}
                <section className="py-20 bg-slate-50">
                    <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
                        <div className="grid lg:grid-cols-2 gap-16 items-center lg:flex-row-reverse">
                            {/* Text Content */}
                            <motion.div
                                initial={{ opacity: 0, x: 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8 }}
                                className="lg:order-2"
                            >
                                <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-600 mb-6">
                                    <LayoutGrid size={32} />
                                </div>
                                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Çok Yönlü Öğrenme Modları</h2>
                                <p className="text-lg text-slate-600 leading-relaxed mb-6">
                                    Sıkıcı tekrarlardan kurtulun. Yazma, Seçme ve Kart modları ile beyninizin farklı bölgelerini çalıştırın ve öğrenmeyi kalıcı hale getirin.
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                        <div className="font-bold text-slate-900 mb-1">Yazma Modu</div>
                                        <p className="text-xs text-slate-500">Kas hafızasını geliştirir.</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                        <div className="font-bold text-slate-900 mb-1">Seçme Modu</div>
                                        <p className="text-xs text-slate-500">Hızlı karar verme yeteneği.</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                        <div className="font-bold text-slate-900 mb-1">Kart Modu</div>
                                        <p className="text-xs text-slate-500">Görsel hafıza teknikleri.</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                        <div className="font-bold text-slate-900 mb-1">Dinleme Modu</div>
                                        <p className="text-xs text-slate-500">Telaffuz ve kulak dolgunluğu.</p>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Visual Content */}
                            <motion.div
                                initial={{ opacity: 0, x: -50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className="lg:order-1 relative"
                            >
                                <div className="absolute inset-0 bg-gradient-to-bl from-rose-400 to-orange-400 rounded-3xl -rotate-3 opacity-20 blur-2xl"></div>
                                <div className="relative bg-white rounded-3xl p-2 border border-slate-100 shadow-2xl">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="bg-slate-50 rounded-xl p-6 flex flex-col items-center justify-center aspect-square border border-slate-100">
                                            <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-indigo-600 mb-3">
                                                <Zap size={24} />
                                            </div>
                                            <div className="font-bold text-slate-700">Hızlı</div>
                                        </div>
                                        <div className="bg-slate-50 rounded-xl p-6 flex flex-col items-center justify-center aspect-square border border-slate-100">
                                            <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-rose-600 mb-3">
                                                <Brain size={24} />
                                            </div>
                                            <div className="font-bold text-slate-700">Akıllı</div>
                                        </div>
                                        <div className="bg-slate-50 rounded-xl p-6 flex flex-col items-center justify-center aspect-square border border-slate-100">
                                            <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-amber-600 mb-3">
                                                <LayoutGrid size={24} />
                                            </div>
                                            <div className="font-bold text-slate-700">Pratik</div>
                                        </div>
                                        <div className="bg-slate-50 rounded-xl p-6 flex flex-col items-center justify-center aspect-square border border-slate-100">
                                            <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-green-600 mb-3">
                                                <Sparkles size={24} />
                                            </div>
                                            <div className="font-bold text-slate-700">Eğlenceli</div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Feature 3: Contextual Learning */}
                <section className="py-20 bg-white">
                    <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            <motion.div
                                initial={{ opacity: 0, x: -50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8 }}
                            >
                                <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 mb-6">
                                    <Layers size={32} />
                                </div>
                                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Bağlam İçinde Öğrenme</h2>
                                <p className="text-lg text-slate-600 leading-relaxed mb-6">
                                    Kelimeleri tek başına ezberlemek yerine, gerçek hayatta nasıl kullanıldıklarını görerek öğrenin. Vocasun, her kelimeyi anlamlı cümleler içinde sunar.
                                </p>
                                <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-amber-600 shadow-sm shrink-0">
                                            <MessageCircle size={20} />
                                        </div>
                                        <div>
                                            <p className="text-slate-800 font-medium italic mb-2">"The <span className="text-amber-600 font-bold bg-amber-100 px-1 rounded">serendipity</span> of finding an old friend in a foreign city was amazing."</p>
                                            <p className="text-slate-500 text-sm">Yabancı bir şehirde eski bir arkadaşı bulmanın <span className="font-bold text-slate-700">şans eseri mutluluğu</span> harikaydı.</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, x: 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className="relative"
                            >
                                <div className="absolute inset-0 bg-gradient-to-tr from-amber-400 to-yellow-400 rounded-3xl rotate-3 opacity-20 blur-2xl"></div>
                                <div className="relative bg-white rounded-3xl p-8 border border-slate-100 shadow-2xl">
                                    <div className="space-y-4">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-amber-200 transition-colors">
                                                <div className="w-2 h-12 bg-slate-200 rounded-full"></div>
                                                <div className="flex-1 space-y-2">
                                                    <div className="h-2 bg-slate-200 rounded w-3/4"></div>
                                                    <div className="h-2 bg-slate-200 rounded w-1/2"></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-24 bg-slate-900 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-900 to-slate-900"></div>
                    <div className="container mx-auto px-4 sm:px-6 max-w-4xl text-center relative z-10">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Hemen Başlayın</h2>
                            <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
                                Vocasun'ın tüm özelliklerini keşfetmek ve dil öğrenme yolculuğunuzu başlatmak için ücretsiz üye olun.
                            </p>
                            <Link
                                href="/register"
                                className="inline-flex items-center gap-3 bg-white text-slate-900 px-8 py-4 rounded-full text-lg font-bold hover:bg-slate-100 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
                            >
                                Ücretsiz Kayıt Ol
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
