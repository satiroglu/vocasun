'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CTA() {
    return (
        <section className="py-16 px-6 bg-white">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="max-w-5xl mx-auto bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 rounded-xl p-8 md:p-12 text-center text-white shadow-2xl shadow-indigo-300/50 relative overflow-hidden group"
            >

                {/* Animated Background Elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-white/10 rounded-full blur-[80px] animate-pulse"></div>
                    <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/30 rounded-full blur-[80px] animate-pulse delay-1000"></div>
                </div>

                <div className="relative z-10">
                    <motion.h2
                        initial={{ y: 20, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="text-xl md:text-4xl font-extrabold mb-4 tracking-tight leading-tight"
                    >
                        Kelime hazineni <br className="md:hidden" /> genişletmeye hazır mısın?
                    </motion.h2>
                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="text-indigo-100 text-base md:text-lg mb-8 max-w-xl mx-auto font-medium leading-relaxed"
                    >
                        Binlerce kullanıcı arasına katıl ve İngilizce öğrenme yolculuğunu hızlandır. Tamamen ücretsiz.
                    </motion.p>
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                    >
                        <Link href="/register">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-white text-indigo-600 px-8 py-3 rounded-xl font-bold text-lg hover:bg-indigo-50 transition shadow-xl hover:shadow-2xl flex items-center gap-2 mx-auto"
                            >
                                Hemen Başla
                                <ArrowRight size={18} />
                            </motion.button>
                        </Link>
                    </motion.div>
                </div>
            </motion.div>
        </section>
    );
}



