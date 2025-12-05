import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Shield, Eye, EyeOff, Lock } from 'lucide-react';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { useUser } from '@/hooks/useUser';

interface SecuritySettingsProps {
    userData: {
        email: string;
    };
    showMessage: (type: 'success' | 'error', text: string) => void;
}

export default function SecuritySettings({ userData, showMessage }: SecuritySettingsProps) {
    const { refreshUser } = useUser();
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
    const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });
    const [saving, setSaving] = useState(false);

    const savePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (!passwords.current || !passwords.new) throw new Error("Alanları doldurun.");
            if (passwords.new.length < 6) throw new Error("Yeni şifre en az 6 karakter olmalı.");
            if (passwords.new !== passwords.confirm) throw new Error("Yeni şifreler uyuşmuyor.");

            const { error: loginError } = await supabase.auth.signInWithPassword({
                email: userData.email,
                password: passwords.current
            });
            if (loginError) throw new Error("Mevcut şifreniz hatalı.");

            const { error: updateError } = await supabase.auth.updateUser({ password: passwords.new });
            if (updateError) throw updateError;
            // KRİTİK NOKTA: Veritabanı güncellendi, şimdi arayüzü yenile
            await refreshUser();
            setPasswords({ current: '', new: '', confirm: '' });
            showMessage('success', 'Şifreniz başarıyla değiştirildi.');
        } catch (error: any) {
            showMessage('error', error.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <section className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl"><Shield size={24} /></div>
                <div>
                    <h2 className="text-lg font-bold text-slate-800">Güvenlik</h2>
                    <p className="text-sm text-slate-500">Şifreni güncelle.</p>
                </div>
            </div>

            <form onSubmit={savePassword}>
                <div className="relative mb-5">
                    <Input
                        label="Mevcut Şifre"
                        value={passwords.current}
                        onChange={(e: any) => setPasswords(p => ({ ...p, current: e.target.value }))}
                        type={showPass.current ? "text" : "password"}
                        className="pr-10"
                    />
                    <button type="button" onClick={() => setShowPass(s => ({ ...s, current: !s.current }))} className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-600">
                        {showPass.current ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
                    <div className="relative">
                        <Input
                            label="Yeni Şifre"
                            value={passwords.new}
                            onChange={(e: any) => setPasswords(p => ({ ...p, new: e.target.value }))}
                            type={showPass.new ? "text" : "password"}
                            className="pr-10"
                        />
                        <button type="button" onClick={() => setShowPass(s => ({ ...s, new: !s.new }))} className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-600">
                            {showPass.new ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                    <div className="relative">
                        <Input
                            label="Yeni Şifre (Tekrar)"
                            value={passwords.confirm}
                            onChange={(e: any) => setPasswords(p => ({ ...p, confirm: e.target.value }))}
                            type={showPass.confirm ? "text" : "password"}
                            className="pr-10"
                        />
                        <button type="button" onClick={() => setShowPass(s => ({ ...s, confirm: !s.confirm }))} className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-600">
                            {showPass.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                </div>
                <div className="flex justify-end border-t border-slate-50 pt-5">
                    <Button type="submit" isLoading={saving} variant="soft" icon={!saving && <Lock size={18} />}>
                        Şifreyi Yenile
                    </Button>
                </div>
            </form>
        </section>
    );
}
