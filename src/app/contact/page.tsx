'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/landing/Footer';
import { Mail, Send, MessageSquare, MapPin, Phone, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Contact() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans overflow-hidden">
            <Navbar />

            <main className="pt-24 pb-20">

                {/* Hero Section */}
                <section className="relative py-20 overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-indigo-100/50 via-slate-50 to-slate-50 -z-10"></div>
                    <div className="container mx-auto px-4 sm:px-6 max-w-5xl relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="text-center max-w-4xl mx-auto mb-16"
                        >
                            <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
                                İletişime <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Geç</span>
                            </h1>
                            <p className="text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
                                Sorularınız, önerileriniz veya sadece merhaba demek için buradayız. Vocasun ekibi olarak sizi dinlemekten mutluluk duyarız.
                            </p>
                        </motion.div>

                        <div className="grid lg:grid-cols-3 gap-8 items-start">

                            {/* Contact Info Column */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="lg:col-span-1 space-y-6"
                            >
                                {/* Email Card */}
                                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg hover:shadow-xl transition-all duration-300 group">
                                    <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 transition-transform">
                                        <Mail size={28} />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">E-posta</h3>
                                    <p className="text-slate-500 mb-4 leading-relaxed">
                                        Genel sorular, destek talepleri ve işbirlikleri için bize her zaman yazabilirsiniz.
                                    </p>
                                    <a href="mailto:hello@vocasun.com" className="text-indigo-600 font-bold text-lg hover:text-indigo-700 transition-colors flex items-center gap-2">
                                        hello@vocasun.com
                                        <ArrowRight size={18} />
                                    </a>
                                </div>

                                {/* Live Support Card */}
                                <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-3xl border border-slate-700 shadow-lg text-white relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
                                    <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform relative z-10">
                                        <MessageSquare size={28} />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2 relative z-10">Canlı Destek</h3>
                                    <p className="text-slate-300 mb-4 leading-relaxed relative z-10">
                                        Anlık yardıma mı ihtiyacınız var? Çok yakında web sitemiz üzerinden canlı destek hizmeti vermeye başlayacağız.
                                    </p>
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-indigo-200 border border-white/10 relative z-10">
                                        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></span>
                                        Yakında
                                    </div>
                                </div>
                            </motion.div>

                            {/* Form Column */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 0.4 }}
                                className="lg:col-span-2"
                            >
                                <div className="bg-white p-8 md:p-10 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

                                    <h3 className="text-2xl font-bold text-slate-900 mb-8 relative z-10">Bize Yazın</h3>

                                    <form className="space-y-6 relative z-10" onSubmit={(e) => e.preventDefault()}>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-slate-700 ml-1">Adınız</label>
                                                <input
                                                    type="text"
                                                    className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium text-slate-800 placeholder:text-slate-400"
                                                    placeholder="Adınız"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-slate-700 ml-1">Soyadınız</label>
                                                <input
                                                    type="text"
                                                    className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium text-slate-800 placeholder:text-slate-400"
                                                    placeholder="Soyadınız"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 ml-1">E-posta Adresiniz</label>
                                            <input
                                                type="email"
                                                className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium text-slate-800 placeholder:text-slate-400"
                                                placeholder="adsoyad@email.com"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 ml-1">Mesajınız</label>
                                            <textarea
                                                rows={6}
                                                className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all resize-none font-medium text-slate-800 placeholder:text-slate-400"
                                                placeholder="Mesajınızı buraya yazın..."
                                            ></textarea>
                                        </div>

                                        <div className="pt-2">
                                            <button className="w-full bg-slate-900 text-white font-bold py-5 rounded-xl hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl active:scale-[0.99] flex items-center justify-center gap-3 group">
                                                <span>Mesajı Gönder</span>
                                                <Send size={20} className="group-hover:translate-x-1 transition-transform" />
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </motion.div>

                        </div>
                    </div>
                </section>

            </main>

            <Footer />
        </div>
    );
}
