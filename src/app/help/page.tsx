'use client';

import React from 'react';
import { HelpCircle, Mail, MessageCircle, FileText } from 'lucide-react';

export default function HelpPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans pt-20 pb-20">
            <div className="flex-grow max-w-5xl mx-auto w-full px-4 sm:px-6 space-y-8">

                {/* Header - Left Aligned Standard Style */}
                <div className="flex items-center gap-5 mb-8">
                    <div className="shrink-0 p-4 bg-indigo-50 text-indigo-600 rounded-2xl shadow-sm border border-indigo-100">
                        <HelpCircle size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-1">Nasıl Yardımcı Olabiliriz?</h1>
                        <p className="text-slate-500 font-medium">Sorularınız, önerileriniz veya yaşadığınız sorunlar için buradayız.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Contact Options */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Email Support */}
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-4">
                                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                                    <Mail size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">E-posta Desteği</h3>
                                    <p className="text-slate-500 text-sm mt-1">Bize her zaman e-posta gönderebilirsiniz. En kısa sürede dönüş yapacağız.</p>
                                </div>
                                <a href="mailto:hello@vocasun.com" className="inline-block w-full text-center px-4 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors text-sm">
                                    hello@vocasun.com
                                </a>
                            </div>

                            {/* FAQ / Guide */}
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-4">
                                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                                    <FileText size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">Rehber & SSS</h3>
                                    <p className="text-slate-500 text-sm mt-1">Uygulamayı nasıl kullanacağınızı öğrenmek için rehberimize göz atın.</p>
                                </div>
                                <a href="/info" className="inline-block w-full text-center px-4 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors text-sm">
                                    Rehbere Git
                                </a>
                            </div>
                        </div>

                        {/* Additional Info or FAQ Section could go here */}
                        <div className="bg-indigo-900 text-white p-8 rounded-3xl relative overflow-hidden">
                            <div className="relative z-10">
                                <h3 className="text-2xl font-bold mb-2">Hala sorunuz mu var?</h3>
                                <p className="text-indigo-200 mb-6 max-w-md">
                                    Ekibimiz size yardımcı olmaktan mutluluk duyacaktır. Formu doldurarak bize ulaşabilirsiniz.
                                </p>
                            </div>
                            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-800 rounded-full opacity-50 blur-3xl"></div>
                            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-purple-600 rounded-full opacity-30 blur-2xl"></div>
                        </div>
                    </div>

                    {/* Right Column: Feedback Form */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-full">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                    <MessageCircle size={20} />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">Geri Bildirim</h3>
                            </div>

                            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Konu</label>
                                    <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium text-slate-700">
                                        <option>Genel Görüş</option>
                                        <option>Hata Bildirimi</option>
                                        <option>Özellik İsteği</option>
                                        <option>Diğer</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Mesajınız</label>
                                    <textarea
                                        rows={6}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium text-slate-700 resize-none"
                                        placeholder="Düşüncelerinizi buraya yazın..."
                                    ></textarea>
                                </div>
                                <button className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 text-sm">
                                    Gönder
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
