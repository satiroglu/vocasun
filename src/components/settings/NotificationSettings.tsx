import React, { useState } from 'react';
import { Bell, Mail, Globe } from 'lucide-react';
import Button from '@/components/Button';

interface NotificationSettingsProps {
    userData: {
        emailNotifications: boolean;
        marketingEmails: boolean;
    };
    showMessage: (type: 'success' | 'error', text: string) => void;
}

export default function NotificationSettings({ userData, showMessage }: NotificationSettingsProps) {
    const [formData, setFormData] = useState(userData);
    const [saving, setSaving] = useState(false);

    const saveNotifications = async () => {
        setSaving(true);
        setTimeout(() => {
            showMessage('success', 'Bildirim ayarları güncellendi.');
            setSaving(false);
        }, 800);
    };

    return (
        <section className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl"><Bell size={24} /></div>
                <div>
                    <h2 className="text-lg font-bold text-slate-800">Bildirimler</h2>
                    <p className="text-sm text-slate-500">E-posta tercihlerini yönet.</p>
                </div>
            </div>

            <div className="space-y-3 mb-8">
                <label className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition cursor-pointer group">
                    <div className="flex items-center gap-4">
                        <div className="bg-white p-2 rounded-lg border border-slate-100 shadow-sm text-slate-400 group-hover:text-indigo-500 transition"><Mail size={18} /></div>
                        <div>
                            <div className="font-bold text-slate-800">Haftalık Özet</div>
                            <div className="text-xs text-slate-500">İlerleme raporun her Pazartesi cebinde.</div>
                        </div>
                    </div>
                    <div className={`w-12 h-6 rounded-full transition-colors relative ${formData.emailNotifications ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                        <input type="checkbox" checked={formData.emailNotifications} onChange={() => setFormData({ ...formData, emailNotifications: !formData.emailNotifications })} className="opacity-0 w-full h-full absolute cursor-pointer z-10" />
                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${formData.emailNotifications ? 'left-7' : 'left-1'}`}></div>
                    </div>
                </label>

                <label className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition cursor-pointer group">
                    <div className="flex items-center gap-4">
                        <div className="bg-white p-2 rounded-lg border border-slate-100 shadow-sm text-slate-400 group-hover:text-indigo-500 transition"><Globe size={18} /></div>
                        <div>
                            <div className="font-bold text-slate-800">Ürün Haberleri</div>
                            <div className="text-xs text-slate-500">Yeni özelliklerden ilk senin haberin olsun.</div>
                        </div>
                    </div>
                    <div className={`w-12 h-6 rounded-full transition-colors relative ${formData.marketingEmails ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                        <input type="checkbox" checked={formData.marketingEmails} onChange={() => setFormData({ ...formData, marketingEmails: !formData.marketingEmails })} className="opacity-0 w-full h-full absolute cursor-pointer z-10" />
                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${formData.marketingEmails ? 'left-7' : 'left-1'}`}></div>
                    </div>
                </label>
            </div>

            <div className="flex justify-end border-t border-slate-50 pt-5">
                <Button onClick={saveNotifications} isLoading={saving} variant="soft">
                    Ayarları Kaydet
                </Button>
            </div>
        </section>
    );
}
