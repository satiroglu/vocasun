'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ArrowLeft, Sun, UserX, CheckCircle, Info } from 'lucide-react';
import Modal from '@/components/Modal';
import Input from '@/components/Input';
import Button from '@/components/Button';

export default function Login() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Modal State'leri
    const [restoreUser, setRestoreUser] = useState<any>(null); // Kurtarılacak kullanıcı ID'si
    const [showRestoreModal, setShowRestoreModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg(null);

        const { data: { user }, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            if (error.message.includes("Email not confirmed")) {
                setErrorMsg("Lütfen önce e-posta adresinize gelen onay linkine tıklayın.");
            } else if (error.message.includes("Invalid login")) {
                setErrorMsg("E-posta veya şifre hatalı.");
            } else {
                setErrorMsg(error.message);
            }
            setLoading(false);
            return;
        }

        if (user) {
            try {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('marked_for_deletion_at')
                    .eq('id', user.id)
                    .single();

                if (profile?.marked_for_deletion_at) {
                    // Silinme sürecinde! Modalı aç.
                    setRestoreUser(user); // Kullanıcıyı hafızaya al
                    setShowRestoreModal(true);
                    // Loading false yapmıyoruz ki arkada form donuk kalsın
                } else {
                    // Temiz giriş
                    router.push('/dashboard');
                    router.refresh();
                }
            } catch (err) {
                router.push('/dashboard'); // Hata olsa da içeri al
            }
        }
    };

    // Hesabı Kurtar
    const handleRestore = async () => {
        if (!restoreUser) return;

        await supabase.from('profiles').update({ marked_for_deletion_at: null }).eq('id', restoreUser.id);

        setShowRestoreModal(false);
        setShowSuccessModal(true); // Başarı modalını aç

        setTimeout(() => {
            router.push('/dashboard');
            router.refresh();
        }, 2000); // 2 sn sonra yönlendir
    };

    // İptal Et ve Çıkış Yap
    const handleCancelRestore = async () => {
        await supabase.auth.signOut();
        setShowRestoreModal(false);
        setLoading(false);
        setShowCancelModal(true);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">

            {/* Logo */}
            <Link href="/" className="mb-8 flex items-center gap-2 text-indigo-600 font-bold text-2xl hover:opacity-80 transition">
                <Sun className="w-8 h-8" />
                <span>Vocasun</span>
            </Link>

            <div className="bg-white w-full max-w-md p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-100">
                <div className="flex items-center mb-6">
                    <Link href="/" className="text-slate-400 hover:text-slate-600 transition mr-auto">
                        <ArrowLeft size={20} />
                    </Link>
                    <h2 className="text-2xl font-bold text-slate-900 mr-auto pr-5">Giriş Yap</h2>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    {errorMsg && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                            <div className="text-red-500 mt-0.5">⚠️</div>
                            <div className="text-sm text-red-700">{errorMsg}</div>
                        </div>
                    )}

                    <Input
                        label="E-posta"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="ornek@email.com"
                    />

                    <div>
                        <div className="relative">
                            <Input
                                label="Şifre"
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="pr-10"
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-600">
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        <div className="flex justify-end -mt-3">
                            <Link href="/forgot-password" className="text-xs text-indigo-600 hover:underline">Şifremi unuttum?</Link>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        isLoading={loading}
                        className="w-full"
                    >
                        Giriş Yap
                    </Button>
                </form>

                <p className="text-center mt-8 text-slate-600 text-sm">
                    Hesabın yok mu? <Link href="/register" className="text-indigo-600 font-bold hover:underline">Kayıt Ol</Link>
                </p>
            </div>

            {/* --- MODALS --- */}

            {/* 1. Kurtarma Onayı Modalı */}
            <Modal
                isOpen={showRestoreModal}
                title="Hesabınız Silinme Aşamasında"
                icon={<UserX size={32} />}
                type="warning"
            >
                <p className="mb-6">
                    Bu hesap silinmek üzere işaretlenmiş. 14 günlük süre henüz dolmadı. Hesabınızı kurtarmak ve silme işlemini iptal etmek ister misiniz?
                </p>
                <div className="flex gap-3">
                    <Button onClick={handleCancelRestore} variant="secondary" className="flex-1">Hayır, Çık</Button>
                    <Button onClick={handleRestore} variant="primary" className="flex-1">Evet, Kurtar</Button>
                </div>
            </Modal>

            {/* 2. Başarı Modalı */}
            <Modal
                isOpen={showSuccessModal}
                title="Hoş Geldiniz!"
                icon={<CheckCircle size={32} />}
                type="success"
            >
                <p className="mb-6">Hesabınız başarıyla kurtarıldı. Kaldığınız yerden devam edebilirsiniz. Yönlendiriliyorsunuz...</p>
            </Modal>

            {/* 3. İptal Modalı */}
            <Modal
                isOpen={showCancelModal}
                onClose={() => setShowCancelModal(false)}
                title="Giriş İptal Edildi"
                icon={<Info size={32} />}
                type="normal"
            >
                <p className="mb-6">Giriş işlemi iptal edildi. Ana sayfaya dönebilir veya tekrar deneyebilirsiniz.</p>
                <Button onClick={() => setShowCancelModal(false)} variant="secondary" className="w-full">Tamam</Button>
            </Modal>

        </div>
    );
}