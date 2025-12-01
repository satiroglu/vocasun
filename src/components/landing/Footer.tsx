'use client';

import Link from 'next/link';
import { Instagram, Twitter, Youtube, Linkedin } from 'lucide-react';
import Logo from '@/components/Logo';

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
    return (
        <footer className="bg-slate-50 border-t border-slate-200 py-12">
            <div className="max-w-5xl mx-auto px-6">

                {/* Top Section: Logo & Socials */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
                    <div className="flex flex-col items-center md:items-start gap-2">
                        <Logo />
                        <p className="text-slate-500 text-sm font-medium">
                            Modern ve yeni nesil kelime öğrenme platformu.
                        </p>
                    </div>

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

                {/* Divider */}
                <div className="h-px bg-slate-200 w-full mb-8"></div>

                {/* Bottom Section: Links & Copyright */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-xs">

                    {/* Navigation Links */}
                    <div className="flex flex-wrap justify-center gap-6 font-medium text-slate-400">
                        <Link href="#" className="hover:text-indigo-600 transition-colors">Hakkımızda</Link>
                        <Link href="#" className="hover:text-indigo-600 transition-colors">Gizlilik</Link>
                        <Link href="#" className="hover:text-indigo-600 transition-colors">Şartlar</Link>
                        <Link href="#" className="hover:text-indigo-600 transition-colors">İletişim</Link>
                    </div>

                    {/* Copyright */}
                    <div className="text-slate-400 font-medium">
                        &copy; {new Date().getFullYear()} Vocasun App.
                    </div>
                </div>

            </div>
        </footer>
    );
}
