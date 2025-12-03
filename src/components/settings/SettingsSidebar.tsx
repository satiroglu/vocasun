import React from 'react';
import { User, BookOpen, Eye as EyeIcon, Bell, Shield, AlertTriangle } from 'lucide-react';

interface SettingsSidebarProps {
    activeSection: string;
    setActiveSection: (section: string) => void;
}

export default function SettingsSidebar({ activeSection, setActiveSection }: SettingsSidebarProps) {
    const menuItems = [
        { id: 'personal', label: 'Kişisel Bilgiler', icon: User },
        { id: 'learning', label: 'Öğrenim Seçenekleri', icon: BookOpen },
        { id: 'appearance', label: 'Görünüm Tercihleri', icon: EyeIcon },
        { id: 'notifications', label: 'Bildirimler', icon: Bell },
        { id: 'security', label: 'Güvenlik', icon: Shield },
        { id: 'danger', label: 'Tehlikeli Bölge', icon: AlertTriangle, danger: true },
    ];

    return (
        <aside className="w-full lg:w-64 shrink-0">
            <div className="bg-white rounded-xl border border-slate-200 lg:sticky lg:top-24 overflow-hidden">
                <div className="p-4 lg:p-4">
                    <h2 className="hidden lg:block text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 px-2">Ayarlar</h2>
                    <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 no-scrollbar">
                        {menuItems.map(item => {
                            const Icon = item.icon;
                            const isActive = activeSection === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveSection(item.id)}
                                    className={`flex-shrink-0 w-auto lg:w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all whitespace-nowrap text-left ${isActive
                                        ? item.danger
                                            ? 'bg-red-50 text-red-700 font-semibold'
                                            : 'bg-indigo-50 text-indigo-700 font-semibold'
                                        : 'text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    <Icon size={20} />
                                    <span className="text-sm">{item.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </div>
        </aside>
    );
}
