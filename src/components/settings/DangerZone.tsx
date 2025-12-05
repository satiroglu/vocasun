import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Trash2, CheckCircle } from 'lucide-react';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import { useUser } from '@/hooks/useUser';

interface DangerZoneProps {
    userData: {
        id: string;
    };
    showMessage: (type: 'success' | 'error', text: string) => void;
}

export default function DangerZone({ userData, showMessage }: DangerZoneProps) {
    const { refreshUser } = useUser();
    const router = useRouter();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false);

    const handleDeleteRequest = async () => {
        try {
            const deletionDate = new Date();
            deletionDate.setDate(deletionDate.getDate() + 14);
            const { error } = await supabase.from('profiles').update({ marked_for_deletion_at: deletionDate.toISOString() }).eq('id', userData.id);
            if (error) throw error;
            // KRİTİK NOKTA: Veritabanı güncellendi, şimdi arayüzü yenile
            await refreshUser();
            setShowDeleteModal(false);
            setShowDeleteSuccessModal(true);
        } catch (error: any) {
            showMessage('error', "Hata: " + error.message);
        }
    };

    return (
        <>
            <section className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-red-100 relative overflow-hidden transition-all hover:shadow-md hover:border-red-200">
                <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                <div className="flex items-center gap-3 mb-4 pl-2">
                    <div className="p-2.5 bg-red-50 text-red-600 rounded-xl"><AlertTriangle size={24} /></div>
                    <h2 className="text-lg font-bold text-slate-800">Tehlikeli Bölge</h2>
                </div>
                <p className="text-slate-500 text-sm mb-6 pl-2">
                    Hesabınızı silme talebi oluşturduğunuzda, verileriniz <b>14 gün boyunca</b> saklanır. Bu süre içinde tekrar giriş yaparsanız silme işlemi iptal edilir.
                </p>
                <div className="flex justify-end border-t border-red-50 pt-5">
                    <Button
                        type="button"
                        onClick={() => setShowDeleteModal(true)}
                        variant="danger"
                        icon={<Trash2 size={18} />}
                    >
                        Hesabımı Sil
                    </Button>
                </div>
            </section>

            {/* Silme Onay Modalı */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Hesabını Silmek Üzeresin"
                icon={<Trash2 size={32} />}
                type="danger"
            >
                <p className="mb-6">Bu işlem başlatıldığında oturumun kapatılacak. 14 gün boyunca giriş yapmazsan tüm verilerin kalıcı olarak silinecek. Emin misin?</p>
                <div className="flex gap-3">
                    <Button onClick={() => setShowDeleteModal(false)} variant="outline" className="flex-1">Vazgeç</Button>
                    <Button onClick={handleDeleteRequest} variant="danger" className="flex-1">Evet, Sil</Button>
                </div>
            </Modal>

            {/* Başarı Modalı */}
            <Modal
                isOpen={showDeleteSuccessModal}
                onClose={() => { }}
                title="İşlem Başlatıldı"
                icon={<CheckCircle size={32} />}
                type="danger"
            >
                <p className="mb-6">Hesabınız silinmek üzere işaretlendi. Sizi ana sayfaya yönlendiriyoruz. Tekrar görüşmek dileğiyle!</p>
                <Button
                    onClick={async () => {
                        await supabase.auth.signOut();
                        router.push('/login');
                    }}
                    variant="secondary"
                    className="w-full"
                >
                    Çıkış Yap
                </Button>
            </Modal>
        </>
    );
}
