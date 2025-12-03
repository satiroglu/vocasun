import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { User, Camera, Mail, Save, AlertTriangle, Info } from 'lucide-react';
import Input from '@/components/Input';
import Button from '@/components/Button';

interface PersonalInfoProps {
    userData: {
        id: string;
        firstName: string;
        lastName: string;
        username: string;
        email: string;
        bio: string;
    };
    showMessage: (type: 'success' | 'error', text: string) => void;
}

export default function PersonalInfo({ userData, showMessage }: PersonalInfoProps) {
    const [formData, setFormData] = useState(userData);
    const [saving, setSaving] = useState(false);
    const [emailUpdateMsg, setEmailUpdateMsg] = useState('');

    const savePersonalInfo = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    first_name: formData.firstName,
                    last_name: formData.lastName,
                    bio: formData.bio
                })
                .eq('id', formData.id);

            if (error) throw error;

            if (formData.email !== userData.email) {
                const { error: emailError } = await supabase.auth.updateUser({ email: formData.email });
                if (emailError) throw emailError;
                setEmailUpdateMsg('Yeni e-posta adresinize doğrulama bağlantısı gönderildi.');
            }
            showMessage('success', 'Kişisel bilgiler güncellendi.');
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Bir hata oluştu';
            showMessage('error', errorMessage);
        } finally {
            setSaving(false);
        }
    };

    return (
        <section className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl"><User size={24} /></div>
                <div>
                    <h2 className="text-lg font-bold text-slate-800">Kişisel Bilgiler</h2>
                    <p className="text-sm text-slate-500">Profil bilgilerini ve fotoğrafını yönet.</p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="relative group">
                    <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center border-4 border-white shadow-sm overflow-hidden">
                        <User size={32} className="text-slate-300" />
                    </div>
                    <button className="absolute bottom-0 right-0 p-1.5 bg-indigo-600 text-white rounded-full shadow-md hover:bg-indigo-700 transition hover:scale-110">
                        <Camera size={14} />
                    </button>
                </div>
                <div className="text-center sm:text-left">
                    <h3 className="font-bold text-slate-800 text-sm">Profil Fotoğrafı</h3>
                    <p className="text-xs text-slate-500 mb-3">Liderlik tablosunda diğer kullanıcılar bu fotoğrafı görecek.</p>
                    <div className="flex justify-center sm:justify-start gap-2">
                        <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:border-indigo-300 hover:text-indigo-600 transition">Fotoğraf Yükle</button>
                        <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-red-500 hover:border-red-200 hover:bg-red-50 transition">Kaldır</button>
                    </div>
                </div>
            </div>

            <form onSubmit={savePersonalInfo}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                    <Input
                        label="Ad"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    />
                    <Input
                        label="Soyad"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    />
                </div>

                <div className="mb-5">
                    <Input
                        label="Kullanıcı Adı"
                        value={formData.username}
                        disabled
                        className="bg-slate-50 text-slate-500 cursor-not-allowed border-slate-100"
                        icon={<span className="text-slate-400 text-sm font-bold">@</span>}
                    />
                    <div className="flex items-start gap-2 mt-2 text-xs text-slate-500">
                        <Info size={14} className="mt-0.5 flex-shrink-0" />
                        <span>Güvenlik nedeniyle kullanıcı adı değiştirilemez.</span>
                    </div>
                </div>

                <div className="mb-8">
                    <Input
                        label="E-posta"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        icon={<Mail size={18} />}
                    />
                    {emailUpdateMsg && <p className="text-xs text-amber-600 mt-2 font-medium bg-amber-50 p-2 rounded-lg border border-amber-100">{emailUpdateMsg}</p>}
                    {formData.email !== userData.email && !emailUpdateMsg && (
                        <div className="flex items-start gap-2 mt-2 p-3 bg-amber-50 rounded-lg border border-amber-100 text-amber-800 text-xs">
                            <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
                            <span>E-posta adresini değiştirdiğinde, hem eski hem de yeni adresine doğrulama bağlantısı gönderilecektir.</span>
                        </div>
                    )}
                </div>

                <div className="mb-5">
                    <Input
                        label="Hakkımda (Bio)"
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        placeholder="Kısaca kendinden bahset..."
                        maxLength={160}
                    />
                    <div className="flex justify-end mt-1">
                        <span className={`text-xs font-medium ${formData.bio.length >= 160 ? 'text-red-500' : 'text-slate-400'}`}>
                            {formData.bio.length}/160
                        </span>
                    </div>
                </div>

                <div className="flex justify-end border-t border-slate-50 pt-5">
                    <Button type="submit" variant="soft" isLoading={saving} icon={!saving && <Save size={18} />}>
                        Değişiklikleri Kaydet
                    </Button>
                </div>
            </form>
        </section>
    );
}
