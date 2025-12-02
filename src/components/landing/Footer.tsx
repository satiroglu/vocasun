'use client';

import Link from 'next/link';
import { Instagram, Twitter, Youtube, Linkedin, Sparkles, ChevronDown } from 'lucide-react';
import Logo from '@/components/Logo';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Custom TikTok Icon
const TikTokIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
);

export default function Footer() {
    const [openSection, setOpenSection] = useState<'kurumsal' | 'yasal' | null>(null);

    const toggleSection = (section: 'kurumsal' | 'yasal') => {
        setOpenSection(openSection === section ? null : section);
    };

    return (
        <footer className="bg-slate-50 border-t border-slate-200 py-10 md:py-16">
            <div className="max-w-5xl mx-auto px-6">

                <div className="flex flex-col md:flex-row justify-between items-start gap-8 md:gap-12 mb-8 md:mb-8">

                    {/* LEFT COLUMN: Logo, Tagline, Socials */}
                    <div className="flex flex-col items-start gap-4 md:gap-6 text-left w-full md:w-auto">
                        <div className="space-y-2">
                            <Logo />
                            <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-xs">
                                Modern ve yeni nesil kelime öğrenme platformu.
                            </p>
                        </div>

                        {/* Social Icons (Left Aligned) */}
                        <div className="flex items-center gap-3">
                            {[
                                { icon: Instagram, href: "#" },
                                { icon: Twitter, href: "#" },
                                { icon: Youtube, href: "#" },
                                { icon: Linkedin, href: "#" },
                                { icon: TikTokIcon, href: "#" }
                            ].map((social, index) => (
                                <Link
                                    key={index}
                                    href={social.href}
                                    className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-300"
                                >
                                    <social.icon size={18} />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Links (Accordion on Mobile, Side-by-Side on Desktop) */}
                    <div className="flex flex-col md:flex-row gap-4 md:gap-16 w-full md:w-auto justify-start md:justify-end text-left">

                        {/* Group 1: Kurumsal */}
                        <div className="flex flex-col w-full md:w-auto">
                            <button
                                onClick={() => toggleSection('kurumsal')}
                                className="flex items-center justify-between w-full md:w-auto group py-2 md:py-0"
                            >
                                <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Kurumsal</h4>
                                <ChevronDown
                                    size={16}
                                    className={`text-slate-400 transition-transform duration-300 md:hidden ${openSection === 'kurumsal' ? 'rotate-180' : ''}`}
                                />
                            </button>

                            {/* Mobile Accordion Content */}
                            <AnimatePresence>
                                {openSection === 'kurumsal' && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="overflow-hidden md:hidden"
                                    >
                                        <div className="flex flex-col gap-2 pt-2 pb-4">
                                            <Link href="/about" className="text-slate-500 hover:text-indigo-600 transition-colors text-sm font-medium">Hakkımızda</Link>
                                            <Link href="/features" className="text-slate-500 hover:text-indigo-600 transition-colors text-sm font-medium">Özellikler</Link>
                                            <Link href="/contact" className="text-slate-500 hover:text-indigo-600 transition-colors text-sm font-medium">İletişim</Link>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Desktop Content (Always Visible) */}
                            <div className="hidden md:flex flex-col gap-2 mt-3">
                                <Link href="/about" className="text-slate-500 hover:text-indigo-600 transition-colors text-sm font-medium">Hakkımızda</Link>
                                <Link href="/features" className="text-slate-500 hover:text-indigo-600 transition-colors text-sm font-medium">Özellikler</Link>
                                <Link href="/contact" className="text-slate-500 hover:text-indigo-600 transition-colors text-sm font-medium">İletişim</Link>
                            </div>
                        </div>

                        {/* Group 2: Yasal */}
                        <div className="flex flex-col w-full md:w-auto">
                            <button
                                onClick={() => toggleSection('yasal')}
                                className="flex items-center justify-between w-full md:w-auto group py-2 md:py-0"
                            >
                                <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Yasal</h4>
                                <ChevronDown
                                    size={16}
                                    className={`text-slate-400 transition-transform duration-300 md:hidden ${openSection === 'yasal' ? 'rotate-180' : ''}`}
                                />
                            </button>

                            {/* Mobile Accordion Content */}
                            <AnimatePresence>
                                {openSection === 'yasal' && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="overflow-hidden md:hidden"
                                    >
                                        <div className="flex flex-col gap-2 pt-2 pb-4">
                                            <Link href="/privacy" className="text-slate-500 hover:text-indigo-600 transition-colors text-sm font-medium">Gizlilik Politikası</Link>
                                            <Link href="/terms" className="text-slate-500 hover:text-indigo-600 transition-colors text-sm font-medium">Kullanım Şartları</Link>
                                            <Link href="/kvkk" className="text-slate-500 hover:text-indigo-600 transition-colors text-sm font-medium">KVKK Aydınlatma Metni</Link>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Desktop Content (Always Visible) */}
                            <div className="hidden md:flex flex-col gap-2 mt-3">
                                <Link href="/privacy" className="text-slate-500 hover:text-indigo-600 transition-colors text-sm font-medium">Gizlilik Politikası</Link>
                                <Link href="/terms" className="text-slate-500 hover:text-indigo-600 transition-colors text-sm font-medium">Kullanım Şartları</Link>
                                <Link href="/kvkk" className="text-slate-500 hover:text-indigo-600 transition-colors text-sm font-medium">KVKK Aydınlatma Metni</Link>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-slate-200 w-full mb-8"></div>

                {/* Bottom Section: Copyright & Changelog */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-xs w-full">

                    {/* Copyright */}
                    <div className="text-slate-400 font-medium text-center md:text-left order-2 md:order-1">
                        &copy; {new Date().getFullYear()} Vocasun App. Tüm hakları saklıdır.
                    </div>

                    {/* Changelog Link */}
                    <Link
                        href="/changelog"
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-600 font-bold hover:bg-indigo-100 transition-colors order-1 md:order-2"
                    >
                        <Sparkles size={14} />
                        <span>Yenilikler</span>
                    </Link>
                </div>

            </div>
        </footer>
    );
}
