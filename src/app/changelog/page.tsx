'use client';

import Footer from '@/components/landing/Footer';
import { motion } from 'framer-motion';
import { Calendar, Tag, Sparkles } from 'lucide-react';

interface ChangeLogItem {
    version: string;
    date: string;
    title: string;
    description: string;
    changes: string[];
    isMajor?: boolean;
}

const changelogData: ChangeLogItem[] = [
    {
        version: "v1.5.0",
        date: "2 Aralık 2025",
        title: "Canlı & Modern Arayüz",
        description: "Vocasun'ın yüzünü tamamen yeniledik! Daha canlı, daha enerjik ve sizi motive edecek yepyeni bir tasarım.",
        changes: [
            "Landing page (açılış sayfası) baştan aşağı yenilendi.",
            "Canlı ve enerjik renk paleti ile modern görünüm.",
            "Mobil cihazlar için responsive tasarım iyileştirmeleri.",
            "Performans ve animasyon optimizasyonları."
        ],
        isMajor: true
    },
    {
        version: "v1.4.0",
        date: "1 Aralık 2025",
        title: "Yönetim & Güvenlik",
        description: "Kullanıcı güvenliği ve yönetim araçlarını güçlendirdik.",
        changes: [
            "E-posta doğrulama sistemi entegre edildi.",
            "Kayıt ve giriş akışlarında güvenlik iyileştirmeleri.",
            "Hatalı giriş denemelerine karşı koruma önlemleri."
        ]
    },
    {
        version: "v1.3.0",
        date: "30 Kasım 2025",
        title: "Öğrenme Deneyimi",
        description: "Kelime öğrenme sürecini daha akıcı ve etkili hale getirecek özellikler.",
        changes: [
            "Yeni 'Yazma Modu': Boşluk doldurma (Cloze) egzersizleri eklendi.",
            "Öğrenme sayfası ilerleme çubuğu (Progress Bar) modernleştirildi.",
            "'Biliyorum' butonu için anlık geri bildirim ve geri alma (undo) özelliği.",
            "Öğrenme modları arası geçişler hızlandırıldı."
        ]
    },
    {
        version: "v1.2.0",
        date: "29 Kasım 2025",
        title: "Topluluk & Rekabet",
        description: "Diğer öğrencilerle yarışabileceğiniz ve gelişiminizi takip edebileceğiniz özellikler.",
        changes: [
            "Liderlik Tablosu (Leaderboard) yenilendi: Haftalık ve Genel sıralama.",
            "Profil sayfası mobil uyumluluğu artırıldı.",
            "Kullanıcı istatistikleri gösterimi iyileştirildi."
        ]
    },
    {
        version: "v1.1.0",
        date: "29 Kasım 2025",
        title: "Başlangıç Deneyimi",
        description: "Vocasun'a ilk adımınızı atarken size eşlik edecek geliştirmeler.",
        changes: [
            "Yeni kullanıcılar için özel 'Hoş Geldiniz' (Welcome) sayfası.",
            "Kayıt akışı (Onboarding) daha anlaşılır hale getirildi.",
        ]
    }
];

export default function ChangelogPage() {
    return (
        <main className="min-h-screen bg-slate-50 font-sans">
            <div className="pt-32 pb-20 max-w-5xl mx-auto px-6">

                {/* Header */}
                <div className="mb-16">
                    <h1 className="text-3xl font-bold text-slate-900 mb-4">Yenilikler & Güncellemeler</h1>
                    <p className="text-slate-600 max-w-2xl">
                        Vocasun'ı her gün daha iyi hale getiriyoruz. İşte yolculuğumuzdaki son gelişmeler.
                    </p>
                </div>

                {/* Compact Timeline */}
                <div className="space-y-8 relative border-l-2 border-slate-200 ml-3">
                    {changelogData.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className="relative pl-8"
                        >
                            {/* Dot */}
                            <div className={`absolute -left-[9px] top-1.5 w-5 h-5 rounded-full border-4 border-slate-50 ${item.isMajor ? 'bg-indigo-600 ring-4 ring-indigo-50' : 'bg-slate-400'
                                }`} />

                            <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4 mb-2">
                                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    {item.title}
                                    {item.isMajor && (
                                        <span className="bg-indigo-100 text-indigo-700 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold flex items-center gap-1">
                                            <Sparkles size={10} /> Major
                                        </span>
                                    )}
                                </h2>
                                <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
                                    <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">{item.version}</span>
                                    <span className="flex items-center gap-1"><Calendar size={12} /> {item.date}</span>
                                </div>
                            </div>

                            <p className="text-slate-600 text-sm mb-3">
                                {item.description}
                            </p>

                            <ul className="space-y-1.5">
                                {item.changes.map((change, cIndex) => (
                                    <li key={cIndex} className="flex items-start gap-2 text-slate-600 text-sm">
                                        <span className="mt-1.5 w-1 h-1 rounded-full bg-slate-400 flex-shrink-0" />
                                        <span>{change}</span>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </div>
            </div>
            <Footer />
        </main>
    );
}
